import { jobQueueServer } from "./globals";
import { isAlmostEmpty, jobIsIncomplete } from "./utils";
import type { Auth, Comment, Job, NewQuota, Project, ProjectUpdate, ServerAbout } from "./types";

interface Cache {
  about: ServerAbout | null;
  jobs: Record<string, Record<string, Job>>;
  collabs: string[];
  projects: Record<string, Record<string, Project>>;
  logs: Record<string, string>;
  comments: Record<string, Comment[]>;
  tags: Record<string, string[]>;
  jobCursor: Record<string, number>;
}

let cache: Cache = {
  about: null,
  jobs: {},
  collabs: [],
  projects: {},
  logs: {},
  comments: {},
  tags: {},
  jobCursor: {},
};

function getRequestConfig(auth: Auth): RequestInit {
  //let token = sessionStorage.getItem("token");
  const config: RequestInit = {
    headers: {
      Authorization: `Bearer ${auth.token}`,
      "Content-Type": "application/json",
    },
  };
  return config;
}

async function serverInfo(): Promise<ServerAbout> {
  if (!cache.about) {
    const response = await fetch(jobQueueServer + "/");
    cache.about = await response.json();
  }
  return cache.about as ServerAbout;
}

async function listCollabs(auth: Auth): Promise<string[]> {
  if (cache.collabs.length === 0) {
    const url = jobQueueServer + "/collabs/?size=100";
    const response = await fetch(url, getRequestConfig(auth));
    cache.collabs = await response.json();
  }
  return cache.collabs;
}

async function queryJobs(collab: string, auth: Auth, requestedSize: number): Promise<Job[]> {
  // size is the total number of jobs that should be returned
  // always starting from index 0
  if (!(collab in cache.jobs)) {
    cache.jobs[collab] = {};
    cache.jobCursor[collab] = 0;
  }
  const cacheSize = Object.keys(cache.jobs[collab]).length;
  const size = Math.max(cacheSize, requestedSize);
  const cursor = cache.jobCursor[collab];
  const delta = size - cursor;
  if (delta > 0) {
    const searchParams = new URLSearchParams();
    searchParams.append("collab", collab);
    const url = `${jobQueueServer}/jobs/?size=${delta}&from_index=${cursor}&${searchParams.toString()}`;
    const response = await fetch(url, getRequestConfig(auth));
    const jobs: Job[] = await response.json();

    cache.jobCursor[collab] = size;
    for (const index in jobs) {
      cache.jobs[collab][jobs[index].id] = jobs[index];
    }
  }
  const jobArray = Object.values(cache.jobs[collab]);
  jobArray.sort((a, b) => {
    return b.id - a.id; // sort by descending order of job id
  });
  // for incomplete jobs, check if they've completed
  const incompleteJobs = jobArray.filter((job) => jobIsIncomplete(job));
  for (const job of incompleteJobs) {
    getJob(job.id, collab, auth);
  }
  return jobArray.slice(0, size);
}

async function queryTags(collab: string, auth: Auth): Promise<string[]> {
  if (!(collab in cache.tags)) {
    const searchParams = new URLSearchParams();
    searchParams.append("collab", collab);
    const url = jobQueueServer + "/tags/?" + searchParams.toString();
    const response = await fetch(url, getRequestConfig(auth));
    const tags = await response.json();
    cache.tags[collab] = tags;
  }
  return cache.tags[collab];
}

async function getJob(jobId: number | string, collab: string, auth: Auth): Promise<Job> {
  if (!(collab in cache.jobs)) {
    cache.jobs[collab] = {};
    cache.jobCursor[collab] = 0;
  }
  if (
    !cache.jobs[collab][jobId] ||
    isAlmostEmpty(cache.jobs[collab][jobId]) ||
    jobIsIncomplete(cache.jobs[collab][jobId])
  ) {
    const url = jobQueueServer + "/jobs/" + jobId;
    const response = await fetch(url, getRequestConfig(auth));
    if (response.ok) {
      cache.jobs[collab][jobId] = await response.json();
    } else if (response.status === 401) {
      console.log(response);
    }
  }
  return cache.jobs[collab][jobId];
}

async function createJob(
  collabId: string,
  jobData: Record<string, unknown>,
  auth: Auth
): Promise<string> {
  jobData.collab = collabId;
  const url = jobQueueServer + "/jobs/";
  const config = getRequestConfig(auth);
  config.method = "POST";
  config.body = JSON.stringify(jobData);
  const response = await fetch(url, config);
  if (response.ok) {
    const createdJob: Job = await response.json();
    // add to cache
    if (!(collabId in cache.jobs)) {
      cache.jobs[collabId] = {};
    }
    cache.jobs[collabId][createdJob.id] = createdJob;
    return "success";
  } else {
    let errorDetails = "";
    try {
      const errors = await response.json();
      errorDetails = errors.detail;
    } catch (err) {
      console.log("Unable to get error details");
      console.log(err);
    }
    throw new Error("Job creation was not successful. " + errorDetails);
  }
}

async function hideJob(collabId: string, jobId: number | string, auth: Auth): Promise<string> {
  const url = jobQueueServer + "/jobs/" + jobId;
  const config = getRequestConfig(auth);
  config.method = "DELETE";
  const response = await fetch(url, config);
  if (response.ok) {
    // remove from cache
    delete cache.jobs[collabId][jobId];
    return "success";
  } else {
    throw new Error("hiding job was not successful");
  }
}

async function getLog(jobId: number | string, auth: Auth): Promise<string> {
  if (!(jobId in cache.logs)) {
    const url = jobQueueServer + "/jobs/" + jobId + "/log";
    const response = await fetch(url, getRequestConfig(auth));
    const log = await response.text();
    cache.logs[jobId] = log;
  }
  return cache.logs[jobId];
}

async function getComments(jobId: number | string, auth: Auth): Promise<Comment[]> {
  if (!(jobId in cache.comments)) {
    const url = jobQueueServer + "/jobs/" + jobId + "/comments";
    const response = await fetch(url, getRequestConfig(auth));
    const comments = await response.json();
    cache.comments[jobId] = comments;
  }
  return cache.comments[jobId];
}

async function createComment(
  jobId: number | string,
  commentData: Partial<Comment>,
  auth: Auth
): Promise<string> {
  const url = jobQueueServer + "/jobs/" + jobId + "/comments/";
  const config = getRequestConfig(auth);
  config.method = "POST";
  config.body = JSON.stringify(commentData);
  const response = await fetch(url, config);
  if (response.ok) {
    const createdComment: Comment = await response.json();
    // add to cache
    cache.comments[jobId].push(createdComment);
    return "success";
  } else {
    throw new Error("commenting was not successful");
  }
}

async function deleteTag(
  collabId: string,
  jobId: number | string,
  tag: string,
  auth: Auth
): Promise<string> {
  const url = jobQueueServer + "/jobs/" + jobId + "/tags/";
  const config = getRequestConfig(auth);
  config.method = "DELETE";
  config.body = JSON.stringify([tag]);
  const response = await fetch(url, config);
  if (response.ok) {
    cache.jobs[collabId][jobId].tags = cache.jobs[collabId][jobId].tags.filter(
      (item) => item !== tag
    );
    return "success";
  } else {
    console.error("Unable to remove tag");
    return "failure";
  }
}

async function addTag(
  collabId: string,
  jobId: number | string,
  tag: string,
  auth: Auth
): Promise<string> {
  const url = jobQueueServer + "/jobs/" + jobId + "/tags/";
  const config = getRequestConfig(auth);
  config.method = "POST";
  config.body = JSON.stringify([tag]);
  const response = await fetch(url, config);
  if (response.ok) {
    if (cache.jobs[collabId][jobId].tags) {
      cache.jobs[collabId][jobId].tags.push(tag);
    } else {
      cache.jobs[collabId][jobId].tags = [tag];
    }
    if (cache.tags[collabId]) {
      if (!cache.tags[collabId].includes(tag)) {
        cache.tags[collabId].push(tag);
      }
    } else {
      cache.tags[collabId] = [tag];
    }
    return "success";
  } else {
    console.error("Unable to add tag");
    return "failure";
  }
}

async function changeRepository(
  collabId: string,
  jobId: number | string,
  targetRepository: string,
  auth: Auth
): Promise<string> {
  const url = jobQueueServer + "/jobs/" + jobId + "/output_data";
  const config = getRequestConfig(auth);
  config.method = "PUT";
  config.body = JSON.stringify({ repository: targetRepository, files: [] });
  const response = await fetch(url, config);
  if (response.ok) {
    const updatedRepository = await response.json();
    // update cache
    cache.jobs[collabId][jobId].output_data = updatedRepository;
    return "success";
  } else {
    throw new Error("changing data repository was not successful");
  }
}

async function queryProjects(collab: string, auth: Auth): Promise<Project[]> {
  if (!(collab in cache.projects)) {
    cache.projects[collab] = {};
  }
  if (isAlmostEmpty(cache.projects[collab])) {
    const searchParams = new URLSearchParams();
    searchParams.append("collab", collab);
    const url = jobQueueServer + "/projects/?size=100&" + searchParams.toString();
    const response = await fetch(url, getRequestConfig(auth));
    const projects: Project[] = await response.json();
    for (const index in projects) {
      cache.projects[collab][projects[index].id] = projects[index];
    }
  }
  const projectArray = Object.values(cache.projects[collab]);
  projectArray.sort((a, b) => {
    if (b.submission_date === null) {
      // unsubmitted projects are listed first
      return 1;
    } else {
      // for submitted projects, sort by descending order of submission date
      return b.submission_date > (a.submission_date as string) ? 1 : -1;
    }
  });
  return projectArray;
}

async function patchProject(
  collabId: string,
  projectId: string,
  modifiedProject: Partial<Project>,
  auth: Auth
): Promise<string> {
  const url = jobQueueServer + "/projects/" + projectId;
  const config = getRequestConfig(auth);
  config.method = "PUT";
  config.body = JSON.stringify(modifiedProject);
  try {
    const response = await fetch(url, config);
    if (response.ok) {
      // update cache
      cache.projects[collabId][projectId] = {
        ...cache.projects[collabId][projectId],
        ...modifiedProject,
      };
      return "success";
    } else {
      throw new Error("project update was not successful");
    }
  } catch (error) {
    console.log(error);
    throw new Error("project update was not successful");
  }
}

async function createProject(
  collabId: string,
  newProject: Partial<Project>,
  auth: Auth
): Promise<string> {
  newProject.collab = collabId;
  const url = jobQueueServer + "/projects/";
  const config = getRequestConfig(auth);
  config.method = "POST";
  config.body = JSON.stringify(newProject);
  const response = await fetch(url, config);
  if (response.ok) {
    const createdProject: Project = await response.json();
    // add to cache
    if (!(collabId in cache.projects)) {
      cache.projects[collabId] = {};
    }
    cache.projects[collabId][createdProject.id] = createdProject;
    return "success";
  } else {
    throw new Error("project creation was not successful");
  }
}

async function deleteProject(collabId: string, projectId: string, auth: Auth): Promise<string> {
  const url = jobQueueServer + "/projects/" + projectId;
  const config = getRequestConfig(auth);
  config.method = "DELETE";
  const response = await fetch(url, config);
  if (response.ok) {
    // update cache
    delete cache.projects[collabId][projectId];
    return "success";
  } else {
    throw new Error("project deletion was not successful");
  }
}

function resetCache() {
  cache = {
    about: null,
    jobs: {},
    collabs: [],
    projects: {},
    logs: {},
    comments: {},
    tags: {},
    jobCursor: {},
  };
}

// Admin section: cross-collab queries that bypass the per-collab cache.

// Fetch every project across all collabs (admin view).
async function queryResourceRequests(auth: Auth, signal?: AbortSignal): Promise<Project[]> {
  const url = jobQueueServer + "/projects/?size=10000&as_admin=true";
  const config = getRequestConfig(auth);
  if (signal) {
    config.signal = signal;
  }
  const response = await fetch(url, config);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return response.json();
}

// Update a project's status (and optionally its description) as an admin.
async function updateResourceRequest(
  project: Project,
  update: ProjectUpdate,
  auth: Auth
): Promise<void> {
  const url = `${jobQueueServer}${project.resource_uri}?as_admin=true`;
  const config = getRequestConfig(auth);
  config.method = "PUT";
  config.body = JSON.stringify(update);
  const response = await fetch(url, config);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
}

// Add a new quota to a project.
async function addQuota(project: Project, newQuota: NewQuota, auth: Auth): Promise<void> {
  const url = `${jobQueueServer}${project.resource_uri}/quotas/`;
  const config = getRequestConfig(auth);
  config.method = "POST";
  config.body = JSON.stringify(newQuota);
  const response = await fetch(url, config);
  if (response.status !== 201) {
    throw new Error(response.statusText);
  }
}

export {
  serverInfo,
  listCollabs,
  queryJobs,
  queryTags,
  getJob,
  createJob,
  hideJob,
  getLog,
  getComments,
  createComment,
  deleteTag,
  addTag,
  changeRepository,
  patchProject,
  createProject,
  deleteProject,
  queryProjects,
  queryResourceRequests,
  updateResourceRequest,
  addQuota,
  resetCache,
};
