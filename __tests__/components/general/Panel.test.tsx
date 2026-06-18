import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";

import Panel from "../../../src/components/general/Panel";

describe("Panel", () => {
  test("renders its label and children when expanded", () => {
    render(
      <Panel label="Hardware config" defaultExpanded={true}>
        <p>panel body</p>
      </Panel>
    );

    expect(screen.getByText("Hardware config")).toBeDefined();
    expect(screen.getByText("panel body")).toBeDefined();
  });

  test("renders nothing when there are no children", () => {
    const { container } = render(<Panel label="Empty" defaultExpanded={true} />);
    expect(container.textContent).toBe("");
  });
});
