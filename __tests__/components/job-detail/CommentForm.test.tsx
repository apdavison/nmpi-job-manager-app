import { describe, expect, test, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import CommentForm from "../../../src/components/job-detail/CommentForm";

describe("CommentForm", () => {
  test("shows a placeholder mentioning the job", () => {
    render(<CommentForm job={101} onSubmit={vi.fn()} />);
    expect(screen.getByPlaceholderText("Comment on job 101")).toBeDefined();
  });

  test("submits the typed comment text", () => {
    const onSubmit = vi.fn();
    render(<CommentForm job={101} onSubmit={onSubmit} />);

    const field = screen.getByRole("textbox");
    fireEvent.change(field, { target: { value: "Looks good" } });
    fireEvent.click(screen.getByRole("button", { name: "Comment" }));

    expect(onSubmit).toHaveBeenCalledWith("Looks good");
  });

  test("clears the field after submitting", () => {
    render(<CommentForm job={101} onSubmit={vi.fn()} />);

    const field = screen.getByRole("textbox");
    fireEvent.change(field, { target: { value: "Looks good" } });
    fireEvent.click(screen.getByRole("button", { name: "Comment" }));

    expect((field as HTMLInputElement).value).toBe("");
  });
});
