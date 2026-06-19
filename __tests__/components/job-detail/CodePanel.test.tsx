import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";

import CodePanel from "../../../src/components/job-detail/CodePanel";

describe("CodePanel", () => {
  test("shows the 'Code' label and the supplied content", () => {
    const code = "import pyNN\npyNN.setup()";
    const { container } = render(<CodePanel content={code} />);

    expect(screen.getByText("Code")).toBeDefined();
    // react-syntax-highlighter splits the code across many spans, so assert on
    // the combined text content rather than on a single text node.
    expect(container.textContent).toContain("import pyNN");
    expect(container.textContent).toContain("pyNN.setup()");
  });
});
