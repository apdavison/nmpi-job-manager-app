import { describe, expect, test, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import EditProjectDialog from "../../../src/components/projects/EditProjectDialog";

const baseProject = {
  id: "11111111-1111-1111-1111-111111111111",
  title: "My project",
  abstract: "My abstract",
  description: "",
};

function renderDialog(props) {
  return render(
    <EditProjectDialog open={true} mode="edit" onClose={vi.fn()} {...props} />
  );
}

describe("EditProjectDialog", () => {
  test("renders nothing when there is no project", () => {
    render(<EditProjectDialog open={true} mode="edit" project={null} onClose={vi.fn()} />);
    expect(screen.queryByText(/quota request/i)).toBeNull();
  });

  test("pre-fills the title and abstract from the project", () => {
    renderDialog({ project: baseProject });
    expect(screen.getByLabelText(/Title/).value).toBe("My project");
    expect(screen.getByLabelText(/Abstract/).value).toBe("My abstract");
  });

  test("shows a validation error and does not close when the title is empty", () => {
    const onClose = vi.fn();
    renderDialog({ project: { ...baseProject, title: "" }, onClose });

    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(screen.getByText("The title is required")).toBeDefined();
    expect(onClose).not.toHaveBeenCalled();
  });

  test("saving with a title closes with the assembled project update", () => {
    const onClose = vi.fn();
    renderDialog({ project: baseProject, onClose });

    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onClose.mock.calls[0][0]).toMatchObject({
      id: baseProject.id,
      title: "My project",
      abstract: "My abstract",
      status: "in preparation",
    });
  });

  test("Cancel closes the dialog with null", () => {
    const onClose = vi.fn();
    renderDialog({ project: baseProject, onClose });

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onClose).toHaveBeenCalledWith(null);
  });

  test("a selected hardware quota is encoded in the description", () => {
    const onClose = vi.fn();
    renderDialog({ project: baseProject, onClose });

    // QuotaSelectors are rendered in order: BrainScaleS, BrainScaleS-2, Spikey, SpiNNaker, Demo
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[3]); // SpiNNaker

    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    const update = onClose.mock.calls[0][0];
    expect(JSON.parse(update.description).requestedQuotas.SpiNNaker).toBe(5000);
  });
});
