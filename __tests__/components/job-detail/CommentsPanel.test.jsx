import { describe, expect, test, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

import CommentsPanel from "../../../src/components/job-detail/CommentsPanel";
import { getComments } from "../../../src/datastore";
import { AuthContext } from "../../../src/context";

// vi.mock is hoisted above imports, so the comment data is created via vi.hoisted
// to keep the asserted string in sync with the mocked response.
const { COMMENT_CONTENT } = vi.hoisted(() => ({
  COMMENT_CONTENT: "Calibration looks correct, membrane traces as expected.",
}));

vi.mock("../../../src/datastore.js", () => ({
  getComments: vi.fn().mockResolvedValue([
    {
      id: 1,
      job_id: 101,
      content: COMMENT_CONTENT,
      user_id: "testuser",
      timestamp: "2024-11-10T10:00:00.000000+00:00",
    },
  ]),
}));

// CommentsPanel uses useSubmit, so it needs a data router.
function renderCommentsPanel() {
  const router = createMemoryRouter(
    [
      {
        path: "/:collabId/jobs/:jobId",
        element: (
          <AuthContext.Provider value={{ token: "t" }}>
            <CommentsPanel jobId={101} collab="neuromorphic-testing" />
          </AuthContext.Provider>
        ),
      },
    ],
    { initialEntries: ["/neuromorphic-testing/jobs/101"] }
  );
  return render(<RouterProvider router={router} />);
}

describe("CommentsPanel", () => {
  test("shows the panel summary and a form to add a comment", () => {
    renderCommentsPanel();
    expect(screen.getByText("Comments")).toBeDefined();
    expect(screen.getByPlaceholderText(/Comment on job/)).toBeDefined();
  });

  test("expanding the panel loads and shows the comments", async () => {
    renderCommentsPanel();

    fireEvent.click(screen.getByRole("button", { name: "Comments" }));

    await waitFor(() => expect(getComments).toHaveBeenCalled());
    expect(await screen.findByText(COMMENT_CONTENT)).toBeDefined();
  });
});
