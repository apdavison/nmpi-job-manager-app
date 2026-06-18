import { describe, expect, test } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

import JobDetail from "../../../src/components/job-detail/JobDetail";
import { AuthContext } from "../../../src/context";
import { jobs } from "../../fixtures";

const collab = "neuromorphic-testing";
const job = jobs[collab][0]; // job 101, finished, BrainScaleS-2

// JobDetail uses useRevalidator/useNavigate (data router) and the AuthContext.
function renderJobDetail() {
  const router = createMemoryRouter(
    [
      {
        path: "/:collabId/jobs/:jobId",
        element: (
          <AuthContext.Provider value={{ token: "t" }}>
            <JobDetail job={job} collab={collab} />
          </AuthContext.Provider>
        ),
      },
    ],
    { initialEntries: [`/${collab}/jobs/101`] }
  );
  return render(<RouterProvider router={router} />);
}

describe("JobDetail", () => {
  test("renders the job header, metadata, code and hardware config", () => {
    const { container } = renderJobDetail();

    expect(screen.getByRole("heading", { level: 2 }).textContent).toContain("Job #101");
    expect(screen.getByText("finished")).toBeDefined();

    // submitted by ... to ...
    expect(screen.getByText("testuser")).toBeDefined();
    expect(screen.getByText("BrainScaleS-2")).toBeDefined();
    // formatted submission and completion timestamps
    expect(screen.getByText("2024/11/10 09:15:00")).toBeDefined();
    expect(screen.getByText("2024/11/10 09:17:22")).toBeDefined();

    // code content (syntax-highlighter splits the text across spans)
    expect(container.textContent).toContain("pynn_brainscales");

    // hardware config key/value ("calibration" is also a tag, so it appears twice;
    // the value "latest" is unique to the hardware config table)
    expect(screen.getAllByText("calibration").length).toBeGreaterThan(0);
    expect(screen.getByText("latest")).toBeDefined();
  });

  test("the delete button opens a confirmation dialog that 'No' dismisses", async () => {
    const { container } = renderJobDetail();

    const deleteButton = container.querySelector('[data-testid="DeleteIcon"]')!.closest("button")!;
    fireEvent.click(deleteButton);

    expect(screen.getByText("Are you sure you wish to delete this job?")).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "No" }));
    await waitForElementToBeRemoved(() =>
      screen.queryByText("Are you sure you wish to delete this job?")
    );
  });
});
