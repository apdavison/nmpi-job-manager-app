import { describe, expect, test, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import Preview from "../../../src/components/job-detail/Preview";

describe("Preview", () => {
  test("renders an image for an image content type", async () => {
    render(
      <Preview open={true} url="http://x/img.png" contentType="image/png" onClose={vi.fn()} />
    );

    // The Dialog renders into a portal on document.body, not inside `container`.
    await waitFor(() => expect(document.querySelector("img")).not.toBeNull());
    expect(document.querySelector("img")!.getAttribute("src")).toEqual("http://x/img.png");
  });

  test("renders no content when closed", () => {
    render(
      <Preview open={false} url="http://x/img.png" contentType="image/png" onClose={vi.fn()} />
    );
    expect(document.querySelector("img")).toBeNull();
  });

  test("the close button calls onClose", () => {
    const onClose = vi.fn();
    render(
      <Preview open={true} url="http://x/img.png" contentType="image/png" onClose={onClose} />
    );

    fireEvent.click(screen.getByRole("button"));
    expect(onClose).toHaveBeenCalled();
  });
});
