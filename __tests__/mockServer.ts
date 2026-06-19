import { jobQueueServer } from "../src/globals";
import { collabs, jobs, tags, logs, comments, projects, serverAbout } from "./fixtures";
import type { Comment, Job, Project } from "../src/types";

function jsonResponse(data: unknown): string {
  return JSON.stringify(data);
}

function handleRequest(url: string, options: { method?: string; body?: any }): string {
  const path = url.replace(jobQueueServer, "");
  const method = options?.method || "GET";
  const body = options?.body ? JSON.parse(options.body) : null;

  // POST /jobs/
  if (method === "POST" && path === "/jobs/") {
    const collabId = body.collab;
    const newJob = {
      id: 999,
      user_id: "testuser",
      status: "submitted",
      timestamp_submission: "2024-11-14T12:00:00.000000+00:00",
      timestamp_completion: null,
      tags: [],
      resource_uri: "/jobs/999",
      resource_usage: null,
      output_data: null,
      ...body,
    } as Job;
    if (!jobs[collabId]) jobs[collabId] = [];
    jobs[collabId].push(newJob);
    return jsonResponse(newJob);
  }

  // POST /jobs/:id/comments/
  const commentPostMatch = path.match(/^\/jobs\/(\d+)\/comments\/$/);
  if (method === "POST" && commentPostMatch) {
    const jobId = parseInt(commentPostMatch[1]);
    const id = Date.now();
    // shaped like the Comment model
    const newComment = {
      id,
      job_id: jobId,
      user_id: "testuser",
      timestamp: "2024-11-14T12:00:00.000000+00:00",
      resource_uri: `/jobs/${jobId}/comments/${id}`,
      ...body,
    } as Comment;
    if (!comments[jobId]) comments[jobId] = [];
    comments[jobId].push(newComment);
    return jsonResponse(newComment);
  }

  // POST /jobs/:id/tags/
  const tagPostMatch = path.match(/^\/jobs\/(\d+)\/tags\/$/);
  if (method === "POST" && tagPostMatch) {
    return jsonResponse(body);
  }

  // DELETE /jobs/:id/tags/
  if (method === "DELETE" && tagPostMatch) {
    return jsonResponse(body);
  }

  // DELETE /jobs/:id
  const jobDeleteMatch = path.match(/^\/jobs\/(\d+)$/);
  if (method === "DELETE" && jobDeleteMatch) {
    return "";
  }

  // PUT /jobs/:id/output_data
  const outputDataMatch = path.match(/^\/jobs\/(\d+)\/output_data$/);
  if (method === "PUT" && outputDataMatch) {
    return jsonResponse(body);
  }

  // POST /projects/
  if (method === "POST" && path === "/projects/") {
    // shaped like the Project model (status defaults to "in preparation")
    const id = "99999999-9999-9999-9999-999999999999";
    const newProject = {
      id,
      status: "in preparation",
      owner: "testuser",
      submission_date: null,
      decision_date: null,
      resource_uri: `/projects/${id}`,
      quotas: [],
      ...body,
    } as Project;
    return jsonResponse(newProject);
  }

  // PUT /projects/:id  (project id is a UUID)
  const projectPutMatch = path.match(/^\/projects\/([0-9a-f-]+)$/i);
  if (method === "PUT" && projectPutMatch) {
    return "";
  }

  // DELETE /projects/:id
  if (method === "DELETE" && projectPutMatch) {
    return "";
  }

  // GET /
  if (path === "/") {
    return jsonResponse(serverAbout);
  }

  // GET /collabs/
  if (path.startsWith("/collabs/")) {
    return jsonResponse(collabs);
  }

  // GET /jobs/:id/log
  const logMatch = path.match(/^\/jobs\/(\d+)\/log$/);
  if (logMatch) {
    const jobId = parseInt(logMatch[1]);
    return logs[jobId] || "";
  }

  // GET /jobs/:id/comments
  const commentsMatch = path.match(/^\/jobs\/(\d+)\/comments$/);
  if (commentsMatch) {
    const jobId = parseInt(commentsMatch[1]);
    return jsonResponse(comments[jobId] || []);
  }

  // GET /jobs/:id
  const jobMatch = path.match(/^\/jobs\/(\d+)$/);
  if (jobMatch) {
    const jobId = parseInt(jobMatch[1]);
    for (const collabJobs of Object.values(jobs)) {
      const job = collabJobs.find((j) => j.id === jobId);
      if (job) return jsonResponse(job);
    }
    return jsonResponse({ status: 404 });
  }

  // GET /jobs/?collab=...&size=...&from_index=...
  if (path.startsWith("/jobs/")) {
    const params = new URLSearchParams(path.split("?")[1]);
    const collab = params.get("collab");
    const size = parseInt(params.get("size") || "10");
    const fromIndex = parseInt(params.get("from_index") || "0");
    const collabJobs = jobs[collab as string] || [];
    return jsonResponse(collabJobs.slice(fromIndex, fromIndex + size));
  }

  // GET /tags/
  if (path.startsWith("/tags/")) {
    const params = new URLSearchParams(path.split("?")[1]);
    const collab = params.get("collab");
    return jsonResponse(tags[collab as string] || []);
  }

  // GET /projects/
  if (path.startsWith("/projects/")) {
    const params = new URLSearchParams(path.split("?")[1]);
    const collab = params.get("collab");
    return jsonResponse(projects[collab as string] || []);
  }

  return jsonResponse({ error: "not found" });
}

function installMockServer() {
  fetchMock.mockResponse((req: any) => {
    const response = handleRequest(req.url, {
      method: req.method,
      body: req.body,
    });
    return Promise.resolve(response);
  });
}

export { installMockServer };
