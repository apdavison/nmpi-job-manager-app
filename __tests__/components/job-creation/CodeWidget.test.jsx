import { describe, expect, test, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// The Monaco editor cannot render in jsdom — replace it with a plain textarea
// that forwards its value through the same onChange contract.
vi.mock("@monaco-editor/react", () => ({
  default: (props) => (
    <textarea
      aria-label="code editor"
      value={props.value}
      onChange={(event) => props.onChange(event.target.value)}
    />
  ),
}));

// DriveBrowser hits the auth/fetch layer; stub it out.
vi.mock("../../../src/components/job-creation/DriveBrowser.jsx", () => ({
  default: () => <div>drive browser</div>,
}));

import CodeWidget from "../../../src/components/job-creation/CodeWidget";

describe("CodeWidget", () => {
  test("editor changes are reported through onChange", () => {
    const onChange = vi.fn();
    render(<CodeWidget initialTab="editor" code="" onChange={onChange} collab="my-collab" />);

    fireEvent.change(screen.getByLabelText("code editor"), {
      target: { value: "print('hi')" },
    });

    expect(onChange).toHaveBeenCalledWith("print('hi')");
  });

  test("switching to the URL tab reveals the URL field", () => {
    render(<CodeWidget initialTab="editor" code="" onChange={vi.fn()} collab="my-collab" />);

    // the URL field lives in a hidden tab panel initially
    expect(screen.queryByLabelText("URL")).toBeNull();

    fireEvent.click(screen.getByRole("tab", { name: /Git repository/i }));

    expect(screen.getByLabelText("URL")).toBeDefined();
  });

  test("flags an invalid URL and only reports valid ones", () => {
    const onChange = vi.fn();
    render(<CodeWidget initialTab="from-url" code="" onChange={onChange} collab="my-collab" />);

    const field = screen.getByLabelText("URL");

    fireEvent.change(field, { target: { value: "not-a-url" } });
    expect(field.getAttribute("aria-invalid")).toBe("true");
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.change(field, { target: { value: "https://github.com/me/repo.git" } });
    expect(field.getAttribute("aria-invalid")).toBe("false");
    expect(onChange).toHaveBeenCalledWith("https://github.com/me/repo.git");
  });

  test("switching to the Drive tab shows the drive browser", () => {
    render(<CodeWidget initialTab="editor" code="" onChange={vi.fn()} collab="my-collab" />);

    fireEvent.click(screen.getByRole("tab", { name: /From Drive/i }));

    expect(screen.getByText("drive browser")).toBeDefined();
  });
});
