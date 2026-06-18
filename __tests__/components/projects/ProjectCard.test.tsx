import { describe, expect, test, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import ProjectCard from "../../../src/components/projects/ProjectCard";
import type { Project } from "../../../src/types";

// Shaped like the Project model (see __tests__/fixtures.ts)
const acceptedProject = {
  id: "11111111-1111-1111-1111-111111111111",
  title: "Cortical column models",
  abstract: "Cortical column model on BrainScaleS-2",
  status: "accepted",
  owner: "testuser",
  submission_date: "2024-06-15",
  quotas: [
    {
      limit: 1000,
      usage: 350,
      platform: "BrainScaleS-2",
      units: "chip-hours",
      resource_uri: "/projects/11111111-1111-1111-1111-111111111111/quotas/1",
    },
  ],
} as Project;

const draftProject = {
  ...acceptedProject,
  status: "in preparation",
  submission_date: null,
} as Project;

describe("ProjectCard", () => {
  test("renders title, abstract, status and quota", () => {
    render(<ProjectCard project={acceptedProject} index={0} />);

    expect(screen.getByText("Cortical column models")).toBeDefined();
    expect(screen.getByText("Cortical column model on BrainScaleS-2")).toBeDefined();
    expect(screen.getByText("accepted")).toBeDefined();
    expect(screen.getByText("BrainScaleS-2")).toBeDefined();
    expect(screen.getByText(/350\/1000 chip-hours/)).toBeDefined();
  });

  test("falls back to 'No title' when the title is empty", () => {
    render(<ProjectCard project={{ ...acceptedProject, title: "" }} index={0} />);
    expect(screen.getByText("No title")).toBeDefined();
  });

  test("shows submitter info for a submitted project", () => {
    render(<ProjectCard project={acceptedProject} index={0} />);
    expect(screen.getByText(/Submitted 2024-06-15 by testuser/)).toBeDefined();
  });

  test("a draft project shows Edit/Submit/Delete buttons wired to the index", () => {
    const handleEdit = vi.fn();
    const handleSubmit = vi.fn();
    const handleDelete = vi.fn();
    render(
      <ProjectCard
        project={draftProject}
        index={3}
        handleEdit={handleEdit}
        handleSubmit={handleSubmit}
        handleDelete={handleDelete}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(handleEdit).toHaveBeenCalledWith(3);
    expect(handleSubmit).toHaveBeenCalledWith(3);
    expect(handleDelete).toHaveBeenCalledWith(3);
  });
});
