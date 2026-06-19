// Mock data shaped to match the job-queue-api Pydantic models
// (see job-queue-api/api/simqueue/data_models.py).

import type { Comment, Job, Project, ServerAbout } from "../src/types";

// GET /collabs/ has response_model=list[str] — a plain list of collab ids
const collabs: string[] = ["neuromorphic-testing", "cortical-models", "spiking-benchmarks"];

// Matches the `Job` model (CompletedJob): id, code, command, collab, input_data,
// hardware_platform, hardware_config, tags, user_id, status, timestamp_submission,
// timestamp_completion, resource_uri, output_data (DataSet), resource_usage (ResourceUsage).
const jobs: Record<string, Job[]> = {
  "neuromorphic-testing": [
    {
      id: 101,
      collab: "neuromorphic-testing",
      user_id: "testuser",
      status: "finished",
      hardware_platform: "BrainScaleS-2",
      hardware_config: { calibration: "latest" },
      command: "",
      code: "import pynn_brainscales.brainscales2 as pynn\npynn.setup()\npop = pynn.Population(10, pynn.cells.HXNeuron())\npynn.run(100)\npynn.end()",
      input_data: null,
      timestamp_submission: "2024-11-10T09:15:00.000000+00:00",
      timestamp_completion: "2024-11-10T09:17:22.000000+00:00",
      tags: ["cortical-model", "calibration"],
      resource_uri: "/jobs/101",
      resource_usage: { value: 0.05, units: "chip-hours" },
      // DataSet: a repository name plus a list of DataItem objects
      output_data: {
        repository: "EBRAINS Drive",
        files: [
          {
            url: "https://drive.ebrains.eu/d/neuromorphic-testing/job_101/results.pkl",
            path: "/neuromorphic-testing/job_101/results.pkl",
            content_type: "application/octet-stream",
            size: 24576,
            hash: "9f1c2d3e4b5a6f7081920a1b2c3d4e5f",
          },
          {
            url: "https://drive.ebrains.eu/d/neuromorphic-testing/job_101/membrane_trace.png",
            path: "/neuromorphic-testing/job_101/membrane_trace.png",
            content_type: "image/png",
            size: 102400,
            hash: "abcdef0123456789abcdef0123456789",
          },
        ],
      },
    },
    {
      id: 102,
      collab: "neuromorphic-testing",
      user_id: "testuser",
      status: "running",
      hardware_platform: "SpiNNaker",
      hardware_config: null,
      command: "",
      code: "import pyNN.spiNNaker as sim\nsim.setup(timestep=1.0)\npop = sim.Population(100, sim.IF_curr_exp())\nsim.run(1000)\nsim.end()",
      input_data: null,
      timestamp_submission: "2024-11-12T14:30:00.000000+00:00",
      timestamp_completion: null,
      tags: ["benchmark"],
      resource_uri: "/jobs/102",
      resource_usage: null,
      output_data: null,
    },
    {
      id: 103,
      collab: "neuromorphic-testing",
      user_id: "testuser2",
      status: "error",
      hardware_platform: "BrainScaleS-2",
      hardware_config: null,
      command: "",
      code: "import pynn_brainscales.brainscales2 as pynn\nraise RuntimeError('configuration error')",
      input_data: null,
      timestamp_submission: "2024-11-08T11:00:00.000000+00:00",
      timestamp_completion: "2024-11-08T11:00:45.000000+00:00",
      tags: [],
      resource_uri: "/jobs/103",
      resource_usage: { value: 0.01, units: "chip-hours" },
      output_data: null,
    },
    {
      id: 104,
      collab: "neuromorphic-testing",
      user_id: "testuser",
      status: "submitted",
      hardware_platform: "SpiNNaker",
      hardware_config: null,
      command: "",
      code: "import pyNN.spiNNaker as sim\nsim.setup()\nsim.end()",
      input_data: null,
      timestamp_submission: "2024-11-13T08:00:00.000000+00:00",
      timestamp_completion: null,
      tags: ["quick-test"],
      resource_uri: "/jobs/104",
      resource_usage: null,
      output_data: null,
    },
    {
      id: 105,
      collab: "neuromorphic-testing",
      user_id: "testuser",
      status: "validated",
      hardware_platform: "BrainScaleS-2",
      hardware_config: null,
      command: "",
      code: "import pynn_brainscales.brainscales2 as pynn\npynn.setup()\npynn.end()",
      input_data: null,
      timestamp_submission: "2024-11-13T10:00:00.000000+00:00",
      timestamp_completion: null,
      tags: [],
      resource_uri: "/jobs/105",
      resource_usage: null,
      output_data: null,
    },
  ],
};

const tags: Record<string, string[]> = {
  "neuromorphic-testing": ["cortical-model", "calibration", "benchmark", "quick-test"],
};

const logs: Record<number, string> = {
  101: "2024-11-10 09:15:01 INFO: Job 101 started on BrainScaleS-2\n2024-11-10 09:17:20 INFO: Experiment completed successfully\n2024-11-10 09:17:22 INFO: Results written to collab storage",
  102: "2024-11-12 14:30:01 INFO: Job 102 started on SpiNNaker\n2024-11-12 14:30:05 INFO: Mapping network to hardware...",
  103: "2024-11-08 11:00:01 INFO: Job 103 started on BrainScaleS-2\n2024-11-08 11:00:44 ERROR: RuntimeError: configuration error",
};

// Matches the `Comment` model: id, job_id, content, user_id, timestamp, resource_uri
const comments: Record<number, Comment[]> = {
  101: [
    {
      id: 1,
      job_id: 101,
      content: "Calibration looks correct, membrane traces as expected.",
      user_id: "testuser",
      timestamp: "2024-11-10T10:00:00.000000+00:00",
      resource_uri: "/jobs/101/comments/1",
    },
    {
      id: 2,
      job_id: 101,
      content: "Rerunning with updated parameters.",
      user_id: "testuser2",
      timestamp: "2024-11-11T09:00:00.000000+00:00",
      resource_uri: "/jobs/101/comments/2",
    },
  ],
  102: [],
};

// Matches the `Project` model: id (UUID), collab, title, abstract, description, status,
// owner, submission_date, decision_date, resource_uri, quotas (list[Quota]).
// Quota: limit, platform, units, usage, project, resource_uri.
const projects: Record<string, Project[]> = {
  "neuromorphic-testing": [
    {
      id: "11111111-1111-1111-1111-111111111111",
      collab: "neuromorphic-testing",
      title: "Cortical column models",
      abstract: "Cortical column model on BrainScaleS-2",
      description: "Cortical column model on BrainScaleS-2",
      status: "accepted",
      owner: "testuser",
      submission_date: "2024-06-15",
      decision_date: "2024-06-20",
      resource_uri: "/projects/11111111-1111-1111-1111-111111111111",
      quotas: [
        {
          limit: 1000,
          usage: 350,
          platform: "BrainScaleS-2",
          units: "chip-hours",
          project: "/projects/11111111-1111-1111-1111-111111111111",
          resource_uri: "/projects/11111111-1111-1111-1111-111111111111/quotas/1",
        },
      ],
    },
    {
      id: "22222222-2222-2222-2222-222222222222",
      collab: "neuromorphic-testing",
      title: "SpiNNaker benchmark suite",
      abstract: "SpiNNaker benchmark suite",
      description: "SpiNNaker benchmark suite",
      status: "in preparation",
      owner: "testuser",
      submission_date: null,
      decision_date: null,
      resource_uri: "/projects/22222222-2222-2222-2222-222222222222",
      quotas: [
        {
          limit: 500,
          usage: 0,
          platform: "SpiNNaker",
          units: "core-hours",
          project: "/projects/22222222-2222-2222-2222-222222222222",
          resource_uri: "/projects/22222222-2222-2222-2222-222222222222/quotas/2",
        },
      ],
    },
    {
      id: "33333333-3333-3333-3333-333333333333",
      collab: "neuromorphic-testing",
      title: "Cross-platform comparison study",
      abstract: "Cross-platform comparison study",
      description: "Cross-platform comparison study",
      status: "under review",
      owner: "testuser",
      submission_date: "2024-09-01",
      decision_date: null,
      resource_uri: "/projects/33333333-3333-3333-3333-333333333333",
      quotas: [
        {
          limit: 200,
          usage: 200,
          platform: "BrainScaleS-2",
          units: "chip-hours",
          project: "/projects/33333333-3333-3333-3333-333333333333",
          resource_uri: "/projects/33333333-3333-3333-3333-333333333333/quotas/3",
        },
        {
          limit: 200,
          usage: 50,
          platform: "SpiNNaker",
          units: "core-hours",
          project: "/projects/33333333-3333-3333-3333-333333333333",
          resource_uri: "/projects/33333333-3333-3333-3333-333333333333/quotas/4",
        },
      ],
    },
  ],
};

// Matches the `/` (about_this_api) response.
const serverAbout: ServerAbout = {
  about: "This is the EBRAINS Neuromorphic Computing Job Queue API.",
  version: "3",
  status: "ok",
  links: { documentation: "/docs" },
};

export { collabs, jobs, tags, logs, comments, projects, serverAbout };
