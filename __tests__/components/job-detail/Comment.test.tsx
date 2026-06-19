import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";

import Comment from "../../../src/components/job-detail/Comment";

describe("Comment", () => {
  test("renders the user, timestamp and content", () => {
    render(
      <Comment
        user_id="testuser"
        timestamp="2024-11-10T10:00:00.000000+00:00"
        content="Calibration looks **correct**."
      />
    );

    expect(screen.getByText("testuser")).toBeDefined();
    expect(screen.getByText("2024-11-10T10:00:00.000000+00:00")).toBeDefined();
    // The Markdown content is rendered; the emphasised word becomes its own element.
    expect(screen.getByText("correct")).toBeDefined();
  });
});
