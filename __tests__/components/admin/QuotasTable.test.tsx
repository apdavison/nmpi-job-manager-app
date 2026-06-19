import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import QuotasTable from "../../../src/components/admin/QuotasTable";
import { makeQuota } from "../../fixtures";

const noop = vi.fn();

function renderTable(allowNew: boolean, quotas = [makeQuota()]) {
  return render(
    <QuotasTable
      quotas={quotas}
      newQuotaPlatform="SpiNNaker"
      setNewQuotaPlatform={noop}
      newQuotaLimit="0"
      setNewQuotaLimit={noop}
      allowNew={allowNew}
    />
  );
}

describe("QuotasTable", () => {
  it("renders a row for each existing quota", () => {
    renderTable(false, [makeQuota({ platform: "SpiNNaker", units: "core-hours" })]);
    expect(screen.getByText("SpiNNaker")).toBeTruthy();
    expect(screen.getByText("core-hours")).toBeTruthy();
  });

  it("renders a platform selector when new quotas are allowed", () => {
    renderTable(true);
    expect(screen.getByRole("combobox")).toBeTruthy();
  });

  it("renders nothing when there are no quotas and new quotas are not allowed", () => {
    const { container } = renderTable(false, []);
    expect(container.firstChild).toBeNull();
  });
});
