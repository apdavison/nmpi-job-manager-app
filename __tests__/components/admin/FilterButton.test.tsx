import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import FilterButton from "../../../src/components/admin/FilterButton";

describe("FilterButton", () => {
  it("renders the target label", () => {
    render(<FilterButton target="accepted" current="under review" onClick={vi.fn()} />);
    expect(screen.getByRole("button", { name: "accepted" })).toBeTruthy();
  });

  it("calls onClick with its target when clicked", () => {
    const onClick = vi.fn();
    render(<FilterButton target="accepted" current="under review" onClick={onClick} />);

    fireEvent.click(screen.getByRole("button", { name: "accepted" }));

    expect(onClick).toHaveBeenCalledWith("accepted");
  });
});
