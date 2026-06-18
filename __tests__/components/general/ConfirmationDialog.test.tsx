import { describe, expect, test, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import ConfirmationDialog from "../../../src/components/general/ConfirmationDialog";

describe("ConfirmationDialog", () => {
  test("shows the content text when open", () => {
    render(<ConfirmationDialog open={true} content="Delete this job?" onClose={vi.fn()} />);
    expect(screen.getByText("Delete this job?")).toBeDefined();
  });

  test("renders nothing when closed", () => {
    render(<ConfirmationDialog open={false} content="Delete this job?" onClose={vi.fn()} />);
    expect(screen.queryByText("Delete this job?")).toBeNull();
  });

  test("clicking Yes confirms with true", () => {
    const onClose = vi.fn();
    render(<ConfirmationDialog open={true} content="Delete this job?" onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: "Yes" }));

    expect(onClose).toHaveBeenCalledWith(true);
  });

  test("clicking No dismisses with false", () => {
    const onClose = vi.fn();
    render(<ConfirmationDialog open={true} content="Delete this job?" onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: "No" }));

    expect(onClose).toHaveBeenCalledWith(false);
  });
});
