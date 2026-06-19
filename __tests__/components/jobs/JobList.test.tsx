import { describe, expect, test } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

import JobList from "../../../src/components/jobs/JobList";
import { jobs, tags } from "../../fixtures";
import { jobIsIncomplete } from "../../../src/utils";
import type { Job } from "../../../src/types";

const collab = "neuromorphic-testing";
const allJobs = jobs[collab];
const collabTags = tags[collab];

// JobList only re-filters in response to the status/hardware/tag selects when there
// are no incomplete jobs (otherwise it sets up an auto-refresh and returns early), so
// the filter-interaction test uses a complete-only subset.
const completeJobs = allJobs.filter((job) => !jobIsIncomplete(job));

function renderJobList(jobList: Job[]) {
  const router = createMemoryRouter(
    [
      {
        path: "/:collabId/jobs/",
        element: <JobList jobs={jobList} tags={collabTags} collab={collab} />,
      },
    ],
    { initialEntries: [`/${collab}/jobs/`] }
  );
  return render(<RouterProvider router={router} />);
}

describe("JobList", () => {
  test("renders the jobs table with a linked row per job", () => {
    const { container } = renderJobList(allJobs);

    expect(screen.getByRole("table", { name: "list-of-jobs" })).toBeDefined();

    for (const job of allJobs) {
      expect(screen.getByText(String(job.id))).toBeDefined();
      expect(
        container.querySelector(`a[href="/${collab}/jobs/${job.id}"]`)
      ).not.toBeNull();
    }
  });

  test("offers a 'Load more' link", () => {
    renderJobList(allJobs);
    expect(screen.getByRole("link", { name: /Load more/i })).toBeDefined();
  });

  test("filtering by status to 'finished' leaves only finished jobs", () => {
    renderJobList(completeJobs);

    // both a finished (101) and an error (103) job are present initially
    expect(screen.getByText("101")).toBeDefined();
    expect(screen.getByText("103")).toBeDefined();

    fireEvent.mouseDown(screen.getByRole("combobox", { name: "Filter by status" }));
    fireEvent.click(screen.getByRole("option", { name: "finished" }));

    expect(screen.getByText("101")).toBeDefined();
    expect(screen.queryByText("103")).toBeNull();
  });
});
