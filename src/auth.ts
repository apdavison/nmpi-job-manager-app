import Keycloak from "keycloak-js";
import type { KeycloakInitOptions } from "keycloak-js";

import { authServer, authClientId, authScopes, adminRoles, userInfoUrl } from "./globals";
import type { Auth } from "./types";

type Main = (auth: Auth) => void;

// Shape of the parts of the EBRAINS userinfo response we rely on.
interface UserInfo {
  roles: {
    team: string[];
  };
}

const keycloak = new Keycloak({
  url: `${authServer}/auth`,
  realm: "hbp",
  clientId: authClientId,
});

const AUTH_MESSAGE = "clb.authenticated";

export default function initAuth(main: Main) {
  console.log("DOM content is loaded, initialising Keycloak client...");
  const isParent = window.opener == null;
  const isIframe = window !== window.parent;
  const isFramedApp = isIframe && isParent;

  const config: KeycloakInitOptions = {};
  if (isFramedApp) {
    config.flow = "implicit";
    // with standard flow, we get a "Timeout when waiting for 3rd party check iframe message"
    // error when embedded as a Collaboratory app
  }
  keycloak
    .init(config)
    .then(() => checkAuth(main))
    .catch(console.log);
}

function checkAuth(main: Main) {
  console.log("Keycloak client is initialised, verifying authentication...");

  // Is the user anonymous or authenticated?
  const isAuthenticated = keycloak.authenticated;
  const isAnonymous = !keycloak.authenticated;
  // Is this app a standalone app, a framed app or a delegate?
  const isParent = window.opener == null;
  const isIframe = window !== window.parent;
  const isMainFrame = window === window.parent;
  const isStandaloneApp = isMainFrame && isParent;
  const isFramedApp = isIframe && isParent;
  const isDelegate = window.opener != null;
  // Posting and listening to messages
  const postMessageToParentTab = (message: string, parentTabOrigin: string) =>
    (window.opener as Window).postMessage(message, parentTabOrigin);
  const listenToMessage = (callback: (event: MessageEvent) => void) =>
    window.addEventListener("message", callback);
  const myAppOrigin = window.location.origin;
  // Manipulating URLs and tabs
  const openTab = (url: URL) => window.open(url);
  const getCurrentURL = () => new URL(window.location.href);
  const closeCurrentTab = () => window.close();

  // A standalone app should simply login if the user is not authenticated
  // and do its business logic otherwise
  if (isStandaloneApp) {
    console.log("This is a standalone app...");
    if (isAnonymous) {
      console.log("...which is not authenticated, starting login...");
      return keycloak.login({ scope: authScopes });
    }
    if (isAuthenticated) {
      console.log("...which is authenticated, starting app with authentication");
      return main(keycloak);
    }
  }

  // A framed app should open a delegate to do the authentication for it and listen to its messages and verify them
  // If the user is authenticated, it should do its business logic
  if (isFramedApp) {
    console.log("This is a framed app...");
    if (isAnonymous) {
      console.log("...which is not authenticated, delegating to new tab...");
      listenToMessage(verifyMessage);
      return openTab(getCurrentURL());
    }
    if (isAuthenticated) {
      console.log("...which is authenticated, starting business logic...");
      return main(keycloak);
    }
  }

  // A delegate should login if the user is not authenticated
  // Otherwise, it should inform its opener that the user is authenticated and close itself
  if (isDelegate) {
    console.log("This is a delegate tab...");
    if (isAnonymous) {
      console.log("...which is not authenticated, starting login...");
      return keycloak.login({ scope: authScopes });
    }
    if (isAuthenticated) {
      console.log("...which is authenticated, warn parent and close...");
      postMessageToParentTab(AUTH_MESSAGE, myAppOrigin);
      return closeCurrentTab();
    }
  }
}

function verifyMessage(event: MessageEvent) {
  console.log("Message received, verifying it...");

  const receivedMessage = event.data;
  const messageOrigin = event.origin;
  const myAppOrigin = window.location.origin;

  // Stop if the message is not the auth message
  if (receivedMessage !== AUTH_MESSAGE) return;

  // Stop if the message is not coming from our app origin
  if (messageOrigin !== myAppOrigin) return;

  // Login otherwise
  return keycloak.login({ scope: authScopes });
}

// Determine whether the authenticated user is a platform administrator by inspecting
// their EBRAINS team roles, and record the result on the auth object.
export function checkPermissions(auth: Auth): Promise<void> {
  const config: RequestInit = {
    headers: {
      Authorization: "Bearer " + auth.token,
    },
  };
  return fetch(userInfoUrl, config)
    .then((response) => response.json())
    .then((userInfo: UserInfo) => {
      auth.isAdmin = adminRoles.some((role) => userInfo.roles.team.includes(role));
      console.log(auth.isAdmin ? "User is an administrator" : "User is not an administrator");
    });
}
