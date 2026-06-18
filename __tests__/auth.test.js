import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";

// auth.js creates a single Keycloak instance at import time. Mock keycloak-js with
// a hoisted singleton so `new Keycloak(...)` returns an object we can drive and inspect.
const { keycloak } = vi.hoisted(() => ({
  keycloak: { authenticated: false, init: vi.fn().mockResolvedValue(true), login: vi.fn() },
}));
vi.mock("keycloak-js", () => ({ default: vi.fn(() => keycloak) }));

import initAuth from "../src/auth";

// initAuth does `keycloak.init(config).then(() => checkAuth(main))` and does not return the
// promise, so tests flush the microtask/timer queue before asserting.
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

// jsdom defaults to window === window.parent and window.opener === null, i.e. a standalone app.
// Switching to the framed or delegate modes means overriding those window properties.
function setFramed() {
  Object.defineProperty(window, "parent", { configurable: true, value: {} });
}

function setDelegate() {
  Object.defineProperty(window, "opener", {
    configurable: true,
    writable: true,
    value: { postMessage: vi.fn() },
  });
}

beforeEach(() => {
  keycloak.authenticated = false;
  vi.clearAllMocks();
  // restoreAllMocks in afterEach wipes the resolved value, so re-establish it each time
  keycloak.init.mockResolvedValue(true);
  // back to the standalone defaults
  Object.defineProperty(window, "parent", { configurable: true, value: window });
  Object.defineProperty(window, "opener", { configurable: true, writable: true, value: null });
  vi.spyOn(window, "open").mockImplementation(() => {});
  vi.spyOn(window, "close").mockImplementation(() => {});
  vi.spyOn(window, "addEventListener");
});

afterEach(() => {
  vi.restoreAllMocks();
  Object.defineProperty(window, "parent", { configurable: true, value: window });
  Object.defineProperty(window, "opener", { configurable: true, writable: true, value: null });
});

describe("initAuth – standalone app", () => {
  test("logs in when anonymous", async () => {
    keycloak.authenticated = false;
    const main = vi.fn();
    initAuth(main);
    await flush();

    expect(keycloak.login).toHaveBeenCalled();
    expect(main).not.toHaveBeenCalled();
  });

  test("runs the app when authenticated", async () => {
    keycloak.authenticated = true;
    const main = vi.fn();
    initAuth(main);
    await flush();

    expect(main).toHaveBeenCalledWith(keycloak);
    expect(keycloak.login).not.toHaveBeenCalled();
  });

  test("initialises Keycloak with the default flow", async () => {
    initAuth(vi.fn());
    await flush();

    expect(keycloak.init).toHaveBeenCalledWith({});
  });
});

describe("initAuth – framed app", () => {
  test("opens a delegate tab and listens for messages when anonymous", async () => {
    setFramed();
    keycloak.authenticated = false;
    const main = vi.fn();
    initAuth(main);
    await flush();

    expect(window.open).toHaveBeenCalled();
    expect(
      window.addEventListener.mock.calls.some((call) => call[0] === "message")
    ).toBe(true);
    expect(main).not.toHaveBeenCalled();
  });

  test("initialises Keycloak with the implicit flow", async () => {
    setFramed();
    initAuth(vi.fn());
    await flush();

    expect(keycloak.init).toHaveBeenCalledWith({ flow: "implicit" });
  });

  test("runs the app when authenticated", async () => {
    setFramed();
    keycloak.authenticated = true;
    const main = vi.fn();
    initAuth(main);
    await flush();

    expect(main).toHaveBeenCalledWith(keycloak);
  });
});

describe("initAuth – delegate tab", () => {
  test("logs in when anonymous", async () => {
    setDelegate();
    keycloak.authenticated = false;
    initAuth(vi.fn());
    await flush();

    expect(keycloak.login).toHaveBeenCalled();
  });

  test("notifies the opener and closes when authenticated", async () => {
    setDelegate();
    keycloak.authenticated = true;
    initAuth(vi.fn());
    await flush();

    expect(window.opener.postMessage).toHaveBeenCalledWith(
      "clb.authenticated",
      window.location.origin
    );
    expect(window.close).toHaveBeenCalled();
  });
});

describe("verifyMessage (the framed-app message listener)", () => {
  // Reach the un-exported verifyMessage by capturing the listener auth.js registers
  // with window.addEventListener in the framed + anonymous branch.
  async function captureListener() {
    setFramed();
    keycloak.authenticated = false;
    initAuth(vi.fn());
    await flush();
    const call = window.addEventListener.mock.calls.find((c) => c[0] === "message");
    return call[1];
  }

  test("logs in for a valid auth message from the app origin", async () => {
    const listener = await captureListener();
    keycloak.login.mockClear();

    listener({ data: "clb.authenticated", origin: window.location.origin });

    expect(keycloak.login).toHaveBeenCalled();
  });

  test("ignores a message with unexpected content", async () => {
    const listener = await captureListener();
    keycloak.login.mockClear();

    listener({ data: "something-else", origin: window.location.origin });

    expect(keycloak.login).not.toHaveBeenCalled();
  });

  test("ignores a valid message from a different origin", async () => {
    const listener = await captureListener();
    keycloak.login.mockClear();

    listener({ data: "clb.authenticated", origin: "https://evil.example" });

    expect(keycloak.login).not.toHaveBeenCalled();
  });
});
