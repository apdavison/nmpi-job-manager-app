import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";

import ProgressIndicator from "../../../src/components/general/ProgressIndicator";

describe("ProgressIndicator", () => {
  test("renders a progress indicator", () => {
    render(<ProgressIndicator />);
    expect(screen.getByRole("progressbar")).toBeDefined();
  });
});
