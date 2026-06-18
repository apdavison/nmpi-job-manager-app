import { describe, expect, test, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

// CodeWidget pulls in the Monaco editor; replace it with a no-op so this test
// can focus on the form's own behaviour.
vi.mock("../../../src/components/job-creation/CodeWidget", () => ({
  default: () => <div>code widget</div>,
}));

import CreateJobForm from "../../../src/components/job-creation/CreateJobForm";

// Render the form inside a data router so useSubmit works, and capture the
// payload via a stub action on the target route.
function renderForm() {
  const submitted = { payload: null };
  const router = createMemoryRouter(
    [
      {
        path: "/:collabId/jobs/new",
        element: <CreateJobForm collab="my-collab" />,
        action: async ({ request }) => {
          submitted.payload = await request.json();
          return null;
        },
      },
    ],
    { initialEntries: ["/my-collab/jobs/new"] }
  );
  render(<RouterProvider router={router} />);
  return submitted;
}

describe("CreateJobForm", () => {
  test("parses comma/semicolon separated tags into an array", () => {
    renderForm();

    const tagsField = screen.getByLabelText("Tags");
    fireEvent.change(tagsField, { target: { value: "alpha,beta;gamma" } });

    // the field shows the tags comma-joined
    expect((tagsField as HTMLInputElement).value).toBe("alpha,beta,gamma");
  });

  test("submitting sends the assembled job to the action", async () => {
    const submitted = renderForm();

    fireEvent.change(screen.getByLabelText("Command"), { target: { value: "run.py" } });
    fireEvent.change(screen.getByLabelText("Tags"), { target: { value: "alpha,beta" } });

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => expect(submitted.payload).not.toBeNull());
    expect(submitted.payload).toMatchObject({
      collab: "my-collab",
      command: "run.py",
      tags: ["alpha", "beta"],
    });
  });
});
