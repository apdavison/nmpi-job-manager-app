import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";

import StatusWarning from "../../../src/components/general/StatusWarning";

describe("StatusWarning", () => {
  test("displays the status message passed in", () => {
    render(<StatusWarning status="The server is in read-only mode" />);
    expect(screen.getByText(/The server is in read-only mode/)).toBeDefined();
  });

  test("shows a Warning heading", () => {
    render(<StatusWarning status="down for maintenance" />);
    expect(screen.getByRole("heading", { name: /warning/i })).toBeDefined();
  });

  test("links to the documentation", () => {
    render(<StatusWarning status="down" />);
    const link = screen.getByRole("link", { name: /documentation/i });
    expect(link.getAttribute("href")).toBe(
      "https://electronicvisions.github.io/hbp-sp9-guidebook"
    );
  });
});
