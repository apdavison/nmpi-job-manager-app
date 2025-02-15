import { jobQueueServer } from "./globals";
import { isAlmostEmpty, jobIsIncomplete } from "./utils";

let cache = {
  jobs: {},
  collabs: [],
  projects: {},
  logs: {},
  comments: {},
  tags: {},
  jobCursor: {},
};

function getRequestConfig(auth) {
  //let token = sessionStorage.getItem("token");
  let config = {
    headers: {
      Authorization: "Bearer " + auth.token,
      "Content-Type": "application/json",
    },
  };
  return config;
}

async function listCollabs(auth) {
  if (cache.collabs.length === 0) {
    const url = jobQueueServer + "/collabs/?size=100";
    const response = await fetch(url, getRequestConfig(auth));
    cache.collabs = await response.json();
  }
  return cache.collabs;
}

async function queryJobs(collab, auth, requestedSize) {
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
    const jobs = await response.json();

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

async function queryTags(collab, auth) {
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

async function getJob(jobId, collab, auth) {
  if (!(collab in cache.jobs)) {
    cache.jobs[collab] = {};
    cache.jobCursor[collab] = 0;
  }
  if (
    !cache.jobs[collab][jobId] ||
    isAlmostEmpty(cache.jobs[collab][jobId]) ||
    jobIsIncomplete(cache.jobs[collab][jobId])
  ) {
    let url = jobQueueServer + "/jobs/" + jobId;
    const response = await fetch(url, getRequestConfig(auth));
    if (response.ok) {
      cache.jobs[collab][jobId] = await response.json();
    } else if (response.status === 401) {
      console.log(response);
    }
  }
  return cache.jobs[collab][jobId];
}

async function createJob(collabId, jobData, auth) {
  jobData.collab = collabId;
  const url = jobQueueServer + "/jobs/";
  let config = getRequestConfig(auth);
  config.method = "POST";
  config.body = JSON.stringify(jobData);
  const response = await fetch(url, config);
  if (response.ok) {
    const createdJob = await response.json();
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

async function hideJob(collabId, jobId, auth) {
  const url = jobQueueServer + "/jobs/" + jobId;
  let config = getRequestConfig(auth);
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

async function getLog(jobId, auth) {
  if (!(jobId in cache.logs)) {
    let url = jobQueueServer + "/jobs/" + jobId + "/log";
    const response = await fetch(url, getRequestConfig(auth));
    const log = await response.text();
    cache.logs[jobId] = log;
  }
  return cache.logs[jobId];
}

async function getComments(jobId, auth) {
  if (!(jobId in cache.comments)) {
    const url = jobQueueServer + "/jobs/" + jobId + "/comments";
    const response = await fetch(url, getRequestConfig(auth));
    const comments = await response.json();
    cache.comments[jobId] = comments;
  }
  return cache.comments[jobId];
}

async function createComment(jobId, commentData, auth) {
  const url = jobQueueServer + "/jobs/" + jobId + "/comments/";
  let config = getRequestConfig(auth);
  config.method = "POST";
  config.body = JSON.stringify(commentData);
  const response = await fetch(url, config);
  if (response.ok) {
    const createdComment = await response.json();
    // add to cache
    cache.comments[jobId].push(createdComment);
    return "success";
  } else {
    throw new Error("commenting was not successful");
  }
}

async function deleteTag(collabId, jobId, tag, auth) {
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

async function addTag(collabId, jobId, tag, auth) {
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

async function changeRepository(collabId, jobId, targetRepository, auth) {
  const url = jobQueueServer + "/jobs/" + jobId + "/output_data";
  let config = getRequestConfig(auth);
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

async function queryProjects(collab, auth) {
  if (!(collab in cache.projects)) {
    cache.projects[collab] = {};
  }
  if (isAlmostEmpty(cache.projects[collab])) {
    const searchParams = new URLSearchParams();
    searchParams.append("collab", collab);
    const url = jobQueueServer + "/projects/?size=100&" + searchParams.toString();
    const response = await fetch(url, getRequestConfig(auth));
    const projects = await response.json();
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
      return b.submission_date > a.submission_date ? 1 : -1;
    }
  });
  return projectArray;
}

async function patchProject(collabId, projectId, modifiedProject, auth) {
  const url = jobQueueServer + "/projects/" + projectId;
  let config = getRequestConfig(auth);
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

async function createProject(collabId, newProject, auth) {
  newProject.collab = collabId;
  const url = jobQueueServer + "/projects/";
  let config = getRequestConfig(auth);
  config.method = "POST";
  config.body = JSON.stringify(newProject);
  const response = await fetch(url, config);
  if (response.ok) {
    const createdProject = await response.json();
    // add to cache
    cache.projects[collabId][createdProject.id] = createdProject;
    return "success";
  } else {
    throw new Error("project creation was not successful");
  }
}

async function deleteProject(collabId, projectId, auth) {
  const url = jobQueueServer + "/projects/" + projectId;
  let config = getRequestConfig(auth);
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

export {
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
};
