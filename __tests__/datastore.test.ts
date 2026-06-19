/* global fetchMock */
import { describe, test, expect, beforeEach } from "vitest";
import {
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
  queryProjects,
  patchProject,
  createProject,
  deleteProject,
  resetCache,
} from "../src/datastore";
import { installMockServer } from "./mockServer";
import { collabs, jobs, tags, comments, projects, serverAbout } from "./fixtures";

const auth = { token: "test-token" };
const testCollab = "neuromorphic-testing";

beforeEach(() => {
  fetchMock.resetMocks();
  resetCache();
  installMockServer();
});

describe("serverInfo", () => {
  test("returns server metadata", async () => {
    const info = await serverInfo();
    expect(info.about).toBe(serverAbout.about);
    expect(info.version).toBe(serverAbout.version);
    expect(info.status).toBe("ok");
  });

  test("caches the result across calls", async () => {
    await serverInfo();
    await serverInfo();
    const calls = fetchMock.mock.calls.filter(([url]) => url.endsWith("/"));
    expect(calls).toHaveLength(1);
  });
});

describe("listCollabs", () => {
  test("returns all collabs", async () => {
    const result = await listCollabs(auth);
    expect(result).toHaveLength(collabs.length);
    expect(result[0]).toBe("neuromorphic-testing");
  });

  test("sends authorization header", async () => {
    await listCollabs(auth);
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe("Bearer test-token");
  });

  test("caches the result across calls", async () => {
    await listCollabs(auth);
    await listCollabs(auth);
    const calls = fetchMock.mock.calls.filter(([url]) => url.includes("/collabs/"));
    expect(calls).toHaveLength(1);
  });
});

describe("queryJobs", () => {
  test("returns jobs sorted by descending id", async () => {
    const result = await queryJobs(testCollab, auth, 5);
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].id).toBeGreaterThan(result[i + 1].id);
    }
  });

  test("respects requested size", async () => {
    const result = await queryJobs(testCollab, auth, 3);
    expect(result).toHaveLength(3);
  });

  test("re-fetches incomplete jobs to check for status changes", async () => {
    await queryJobs(testCollab, auth, 5);
    const incompleteStatuses = ["submitted", "running", "validated"];
    const incompleteJobs = jobs[testCollab].filter((j) => incompleteStatuses.includes(j.status));
    // one call for the job list, plus one per incomplete job
    const jobDetailCalls = fetchMock.mock.calls.filter(
      ([url]) => url.match(/\/jobs\/\d+$/)
    );
    expect(jobDetailCalls).toHaveLength(incompleteJobs.length);
  });
});

describe("queryTags", () => {
  test("returns tags for a collab", async () => {
    const result = await queryTags(testCollab, auth);
    expect(result).toEqual(tags[testCollab]);
    expect(result).toContain("cortical-model");
    expect(result).toContain("benchmark");
  });

  test("caches tags across calls", async () => {
    await queryTags(testCollab, auth);
    await queryTags(testCollab, auth);
    const calls = fetchMock.mock.calls.filter(([url]) => url.includes("/tags/"));
    expect(calls).toHaveLength(1);
  });
});

describe("getJob", () => {
  test("returns the correct job", async () => {
    const job = await getJob(101, testCollab, auth);
    expect(job.id).toBe(101);
    expect(job.hardware_platform).toBe("BrainScaleS-2");
    expect(job.status).toBe("finished");
  });

  test("caches finished jobs", async () => {
    await getJob(101, testCollab, auth);
    await getJob(101, testCollab, auth);
    const calls = fetchMock.mock.calls.filter(([url]) => url.includes("/jobs/101"));
    expect(calls).toHaveLength(1);
  });

  test("re-fetches incomplete jobs", async () => {
    await getJob(102, testCollab, auth);
    await getJob(102, testCollab, auth);
    const calls = fetchMock.mock.calls.filter(([url]) => url.includes("/jobs/102"));
    expect(calls).toHaveLength(2);
  });
});

describe("createJob", () => {
  test("returns success and sends job data with collab", async () => {
    const jobData = {
      code: "import pyNN.spiNNaker as sim\nsim.setup()\nsim.end()",
      hardware_platform: "SpiNNaker",
    };
    const result = await createJob(testCollab, jobData, auth);
    expect(result).toBe("success");
    const postCall = fetchMock.mock.calls.find(([, opts]) => opts?.method === "POST");
    const body = JSON.parse(postCall[1].body);
    expect(body.collab).toBe(testCollab);
    expect(body.hardware_platform).toBe("SpiNNaker");
  });

  test("throws on server error", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ detail: "quota exceeded" }), { status: 400 });
    await expect(
      createJob(testCollab, { code: "print(1)" }, auth)
    ).rejects.toThrow("not successful");
  });
});

describe("hideJob", () => {
  test("sends DELETE and returns success", async () => {
    await getJob(101, testCollab, auth);
    const result = await hideJob(testCollab, 101, auth);
    expect(result).toBe("success");
    const deleteCall = fetchMock.mock.calls.find(([, opts]) => opts?.method === "DELETE");
    expect(deleteCall[0]).toContain("/jobs/101");
  });

  test("removes job from cache after hiding", async () => {
    await getJob(103, testCollab, auth);
    await hideJob(testCollab, 103, auth);
    // next getJob should fetch again since it's been removed from cache
    await getJob(103, testCollab, auth);
    const getCalls = fetchMock.mock.calls.filter(
      ([url, opts]) => url.includes("/jobs/103") && (!opts?.method || opts.method === "GET")
    );
    expect(getCalls).toHaveLength(2);
  });
});

describe("getLog", () => {
  test("returns log text for a job", async () => {
    const log = await getLog(101, auth);
    expect(log).toContain("Job 101 started on BrainScaleS-2");
    expect(log).toContain("Experiment completed successfully");
  });

  test("caches logs across calls", async () => {
    await getLog(101, auth);
    await getLog(101, auth);
    const calls = fetchMock.mock.calls.filter(([url]) => url.includes("/jobs/101/log"));
    expect(calls).toHaveLength(1);
  });
});

describe("getComments", () => {
  test("returns comments for a job", async () => {
    const result = await getComments(101, auth);
    expect(result).toHaveLength(comments[101].length);
    expect(result[0].content).toContain("Calibration");
  });

  test("returns empty array for job with no comments", async () => {
    const result = await getComments(102, auth);
    expect(result).toEqual([]);
  });
});

describe("createComment", () => {
  test("adds comment and returns success", async () => {
    await getComments(101, auth);
    const result = await createComment(101, { content: "Looks good" }, auth);
    expect(result).toBe("success");
  });
});

describe("deleteTag", () => {
  test("removes tag and returns success", async () => {
    await getJob(101, testCollab, auth);
    const result = await deleteTag(testCollab, 101, "calibration", auth);
    expect(result).toBe("success");
  });
});

describe("addTag", () => {
  test("adds tag and returns success", async () => {
    await getJob(101, testCollab, auth);
    const result = await addTag(testCollab, 101, "replication", auth);
    expect(result).toBe("success");
  });
});

describe("changeRepository", () => {
  test("sends PUT with target repository and returns success", async () => {
    await getJob(101, testCollab, auth);
    const result = await changeRepository(testCollab, 101, "drive", auth);
    expect(result).toBe("success");
    const putCall = fetchMock.mock.calls.find(
      ([url, opts]) => url.includes("/output_data") && opts?.method === "PUT"
    );
    const body = JSON.parse(putCall[1].body);
    expect(body.repository).toBe("drive");
  });
});

describe("queryProjects", () => {
  test("returns projects for a collab", async () => {
    const result = await queryProjects(testCollab, auth);
    expect(result).toHaveLength(projects[testCollab].length);
  });

  test("sorts unsubmitted projects first", async () => {
    const result = await queryProjects(testCollab, auth);
    expect(result[0].submission_date).toBeNull();
  });

  test("sorts submitted projects by descending submission date", async () => {
    const result = await queryProjects(testCollab, auth);
    const submitted = result.filter((p) => p.submission_date !== null);
    for (let i = 0; i < submitted.length - 1; i++) {
      expect(submitted[i].submission_date! >= submitted[i + 1].submission_date!).toBe(true);
    }
  });
});

describe("patchProject", () => {
  test("sends PUT and returns success", async () => {
    await queryProjects(testCollab, auth);
    const result = await patchProject(
      testCollab,
      "11111111-1111-1111-1111-111111111111",
      { description: "Updated description" },
      auth
    );
    expect(result).toBe("success");
  });
});

describe("createProject", () => {
  test("returns success and sends collab in body", async () => {
    const result = await createProject(testCollab, { description: "New project" }, auth);
    expect(result).toBe("success");
    const postCall = fetchMock.mock.calls.find(
      ([url, opts]) => url.includes("/projects/") && opts?.method === "POST"
    );
    const body = JSON.parse(postCall[1].body);
    expect(body.collab).toBe(testCollab);
  });
});

describe("deleteProject", () => {
  test("sends DELETE and returns success", async () => {
    await queryProjects(testCollab, auth);
    const result = await deleteProject(
      testCollab,
      "11111111-1111-1111-1111-111111111111",
      auth
    );
    expect(result).toBe("success");
  });
});
