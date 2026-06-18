import { describe, expect, test, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import TagDisplay from "../../../src/components/general/TagDisplay";

describe("TagDisplay", () => {
  test("renders a chip for each tag", () => {
    render(<TagDisplay tags={["alpha", "beta"]} />);
    expect(screen.getByText("alpha")).toBeDefined();
    expect(screen.getByText("beta")).toBeDefined();
  });

  test("shows no editing controls when onDelete is not provided", () => {
    render(<TagDisplay tags={["alpha"]} />);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  test("clicking the edit button reveals the add-tag field", () => {
    render(<TagDisplay tags={["alpha"]} onDelete={vi.fn()} onAdd={vi.fn()} />);

    // only the edit button is shown initially
    expect(screen.queryByPlaceholderText("add a tag")).toBeNull();

    fireEvent.click(screen.getByRole("button"));

    expect(screen.getByPlaceholderText("add a tag")).toBeDefined();
  });

  test("typing a tag and clicking add calls onAdd with the new tag", async () => {
    const onAdd = vi.fn();
    render(<TagDisplay tags={["alpha"]} onDelete={vi.fn()} onAdd={onAdd} />);

    fireEvent.click(screen.getByRole("button")); // enter edit mode
    fireEvent.change(screen.getByPlaceholderText("add a tag"), {
      target: { value: "gamma" },
    });

    // in edit mode the buttons are [finished-editing, add]; click the add button
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[buttons.length - 1]);

    // onAdd is awaited inside the component before the field is cleared
    await waitFor(() => expect(onAdd).toHaveBeenCalledWith("gamma"));
  });

  test("deleting a chip in edit mode calls onDelete with the tag", () => {
    const onDelete = vi.fn();
    render(<TagDisplay tags={["alpha"]} onDelete={onDelete} onAdd={vi.fn()} />);

    fireEvent.click(screen.getByRole("button")); // enter edit mode
    // MUI renders the chip's delete affordance with this test id
    fireEvent.click(screen.getByTestId("CancelIcon"));

    expect(onDelete).toHaveBeenCalledWith("alpha");
  });
});
