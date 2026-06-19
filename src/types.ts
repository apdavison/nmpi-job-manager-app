// Shared types for the job-queue-api data models.
// Mirrors job-queue-api/api/simqueue/data_models.py (see __tests__/fixtures.ts).

export type JobStatus =
  | "submitted"
  | "validated"
  | "running"
  | "mapped"
  | "finished"
  | "error"
  | "removed";

export type ProjectStatus = "in preparation" | "under review" | "accepted" | "rejected";

export interface ResourceUsage {
  value: number;
  units: string;
}

export interface DataItem {
  url: string;
  path?: string;
  content_type?: string;
  size?: number;
  hash?: string;
}

export interface DataSet {
  repository: string;
  files: DataItem[];
}

export interface Job {
  id: number;
  collab: string;
  user_id: string;
  status: JobStatus;
  hardware_platform: string;
  hardware_config: Record<string, unknown> | null;
  command: string;
  code: string;
  input_data: DataSet | null;
  timestamp_submission: string | null;
  timestamp_completion: string | null;
  tags: string[];
  resource_uri: string;
  resource_usage: ResourceUsage | null;
  output_data: DataSet | null;
  provenance?: Record<string, unknown> | null;
}

export interface Quota {
  limit: number;
  usage: number;
  platform: string;
  units: string;
  project: string;
  resource_uri: string;
}

export interface Project {
  id: string;
  collab: string;
  title: string;
  abstract: string;
  description: string;
  status: ProjectStatus;
  owner: string;
  submission_date: string | null;
  decision_date: string | null;
  resource_uri: string;
  quotas: Quota[];
}

// A new quota to be added to an existing project (POST .../quotas/), used by the admin
// section.
export interface NewQuota {
  limit: number;
  platform: string;
  units: string;
}

// Fields sent when updating a project's status/description from the admin section
// (PUT .../{resource_uri}).
export interface ProjectUpdate {
  title: string;
  status: string;
  abstract: string;
  owner: string;
  description?: string;
}

export interface Comment {
  id: number;
  job_id: number;
  content: string;
  user_id: string;
  timestamp: string;
  resource_uri: string;
}

export interface ServerAbout {
  about: string;
  version: string;
  status: string;
  links: Record<string, string>;
}

// Auth is either a Keycloak instance (which carries an optional `token`) or, in dev
// mode, a plain object holding a token. The app only reads `token`; `isAdmin` is set
// by the admin permission check (used by the admin section).
export interface Auth {
  token?: string;
  isAdmin?: boolean;
}
