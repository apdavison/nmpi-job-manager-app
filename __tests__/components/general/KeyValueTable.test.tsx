import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";

import KeyValueTable from "../../../src/components/general/KeyValueTable";

describe("KeyValueTable", () => {
  test("renders a row for each key/value pair", () => {
    render(<KeyValueTable data={{ neurons: 100, timestep: 1.0 }} />);

    expect(screen.getByText("neurons")).toBeDefined();
    expect(screen.getByText("100")).toBeDefined();
    expect(screen.getByText("timestep")).toBeDefined();
    expect(screen.getByText("1")).toBeDefined();
  });

  test("joins array values with a comma", () => {
    render(<KeyValueTable data={{ tags: ["a", "b", "c"] }} />);
    expect(screen.getByText("a, b, c")).toBeDefined();
  });

  test("renders keys in bold when boldKeys is set", () => {
    render(<KeyValueTable boldKeys data={{ neurons: 100 }} />);
    const keyCell = screen.getByText("neurons");
    expect(keyCell.tagName).toBe("B");
  });

  test("renders an empty table when there is no data", () => {
    render(<KeyValueTable />);
    const table = screen.getByRole("table");
    // header-less table with no rows
    expect(table.querySelectorAll("tr").length).toBe(0);
  });
});
