import { createContext } from "react";

import type { Auth } from "./types";

const AuthContext = createContext<Auth | null>(null);

const RequestedCollabContext = createContext<string | null>(null);

const StatusContext = createContext<string>("ok");

export { AuthContext, RequestedCollabContext, StatusContext };
