export const jobQueueServer = "https://nmpi-v3.hbpneuromorphic.eu";
export const authServer = "https://iam.ebrains.eu";
export const authClientId = "neuromorphic-remote-access";
export const driveServer = "https://corsproxy.apps.ebrains.eu/https://drive.ebrains.eu";

// Configuration for the admin section.
export const authScopes = "team email profile roles";

// EBRAINS userinfo endpoint, fetched through the CORS proxy so it can be read from the
// browser. Used to determine whether the logged-in user is a platform administrator.
export const corsProxy = "https://corsproxy.apps.ebrains.eu/";
export const userInfoUrl =
  corsProxy + `${authServer}/auth/realms/hbp/protocol/openid-connect/userinfo`;

// Roles that grant access to the admin section.
export const adminRoles = [
  "collab-neuromorphic-platform-admin-editor",
  "collab-neuromorphic-platform-admin-administrator",
];

// Per-platform defaults used by the admin quota form.
export const defaultQuotaSizes: Record<string, string> = {
  BrainScaleS: "0.1",
  "BrainScaleS-2": "1.0",
  SpiNNaker: "5000.0",
  Spikey: "1.0",
  Demo: "1.0",
};

export const platformUnits: Record<string, string> = {
  BrainScaleS: "wafer-hours",
  "BrainScaleS-2": "chip-hours",
  SpiNNaker: "core-hours",
  Spikey: "hours",
  Demo: "hours",
};

export const hw_options = [
  "BrainScaleS",
  "SpiNNaker",
  "BrainScaleS-2",
  "BrainScaleS-ESS",
  "Spikey",
  "Test",
  "Demo",
];

export const INITIAL_JOBS = 10;
export const DELTA_JOBS = 10;
