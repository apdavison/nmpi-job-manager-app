import { describe, expect, test, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import QuotaSelector from "../../../src/components/projects/QuotaSelector";

// The demo quota size for SpiNNaker, as defined in QuotaSelector.jsx
const SPINNAKER_DEMO_SIZE = 5000.0;

describe("QuotaSelector", () => {
  test("shows the platform label", () => {
    render(<QuotaSelector label="SpiNNaker" quota={0} setQuota={vi.fn()} />);
    expect(screen.getByText("SpiNNaker")).toBeDefined();
  });

  test("checkbox is unchecked and the quota field is hidden when quota is 0", () => {
    render(<QuotaSelector label="SpiNNaker" quota={0} setQuota={vi.fn()} />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox.checked).toBe(false);
    // no value/unit field is shown when there is no quota
    expect(screen.queryByRole("textbox")).toBeNull();
  });

  test("checking the box requests the platform's demo quota size", () => {
    const setQuota = vi.fn();
    render(<QuotaSelector label="SpiNNaker" quota={0} setQuota={setQuota} />);

    fireEvent.click(screen.getByRole("checkbox"));

    expect(setQuota).toHaveBeenCalledWith(SPINNAKER_DEMO_SIZE);
  });

  test("unchecking the box resets the quota to 0", () => {
    const setQuota = vi.fn();
    render(<QuotaSelector label="SpiNNaker" quota={SPINNAKER_DEMO_SIZE} setQuota={setQuota} />);

    fireEvent.click(screen.getByRole("checkbox"));

    expect(setQuota).toHaveBeenCalledWith(0);
  });

  test("shows the quota value and units when a quota is set", () => {
    render(<QuotaSelector label="SpiNNaker" quota={100} setQuota={vi.fn()} />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox.checked).toBe(true);
    expect(screen.getByRole("textbox").value).toBe("100");
    expect(screen.getByText("core-hours")).toBeDefined();
  });

  test("editing the quota field reports the new value", () => {
    const setQuota = vi.fn();
    render(<QuotaSelector label="SpiNNaker" quota={100} setQuota={setQuota} />);

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "250" } });

    expect(setQuota).toHaveBeenCalledWith("250");
  });
});
