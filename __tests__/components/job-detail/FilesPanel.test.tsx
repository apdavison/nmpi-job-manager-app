import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

import FilesPanel from "../../../src/components/job-detail/FilesPanel";
import { jobs } from "../../fixtures";
import type { DataSet } from "../../../src/types";

const collab = "neuromorphic-testing";
const dataset = jobs[collab][0].output_data; // job 101, repository "EBRAINS Drive"

// FilesPanel uses useSubmit, so it needs a data router.
function renderFilesPanel(ds: DataSet | null) {
  const router = createMemoryRouter(
    [
      {
        path: "/:collabId/jobs/:jobId",
        element: <FilesPanel label="Output files" dataset={ds} collab={collab} jobId={101} />,
      },
    ],
    { initialEntries: [`/${collab}/jobs/101`] }
  );
  return render(<RouterProvider router={router} />);
}

describe("FilesPanel", () => {
  test("shows the repository, one card per file, download links and KiB sizes", () => {
    const { container } = renderFilesPanel(dataset);

    expect(screen.getByText("EBRAINS Drive")).toBeDefined();

    // The collab prefix is stripped from each file's path.
    expect(screen.getByText("/job_101/results.pkl")).toBeDefined();
    expect(screen.getByText("/job_101/membrane_trace.png")).toBeDefined();

    // Sizes are formatted in KiB (24576 -> 24.0 KiB, 102400 -> 100.0 KiB).
    expect(screen.getByText("24.0 KiB")).toBeDefined();
    expect(screen.getByText("100.0 KiB")).toBeDefined();

    for (const file of dataset!.files) {
      expect(container.querySelector(`a[href="${file.url}"]`)).not.toBeNull();
    }
  });

  test("does not offer copy buttons for a permanent repository", () => {
    renderFilesPanel(dataset);
    expect(screen.queryByRole("button", { name: "Copy to Drive" })).toBeNull();
  });

  test("offers copy buttons when the files are in temporary storage", () => {
    renderFilesPanel({ ...dataset!, repository: "EBRAINS temporary storage" });

    expect(screen.getByRole("button", { name: "Copy to Drive" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Copy to Bucket" })).toBeDefined();
  });
});
