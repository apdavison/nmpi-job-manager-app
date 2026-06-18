import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

import ProjectList from "../../../src/components/projects/ProjectList";
import { projects } from "../../fixtures";

const collabProjects = projects["neuromorphic-testing"];

// ProjectList uses useFetcher, which requires a data router (createMemoryRouter),
// not a plain BrowserRouter.
function renderProjectList(projectList) {
  const router = createMemoryRouter(
    [
      {
        path: "/:collabId/projects/",
        element: <ProjectList collab="neuromorphic-testing" projects={projectList} />,
      },
    ],
    { initialEntries: ["/neuromorphic-testing/projects/"] }
  );
  return render(<RouterProvider router={router} />);
}

describe("ProjectList", () => {
  test("renders a card for each project", () => {
    renderProjectList(collabProjects);

    for (const project of collabProjects) {
      expect(screen.getByRole("heading", { name: project.title })).toBeDefined();
    }
  });

  test("always offers a button to request a new quota", () => {
    renderProjectList(collabProjects);
    expect(screen.getByRole("button", { name: /Request a compute quota/i })).toBeDefined();
  });

  test("renders just the request card when there are no projects", () => {
    renderProjectList([]);
    expect(screen.getByRole("button", { name: /Request a compute quota/i })).toBeDefined();
    expect(screen.getByText("Compute quota requests")).toBeDefined();
  });
});
