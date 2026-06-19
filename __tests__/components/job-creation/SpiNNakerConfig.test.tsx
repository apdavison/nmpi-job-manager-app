import { describe, expect, test, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import SpiNNakerConfig from "../../../src/components/job-creation/SpiNNakerConfig";

describe("SpiNNakerConfig", () => {
  test("passes the sPyNNaker version through as a string", () => {
    const onChange = vi.fn();
    render(<SpiNNakerConfig config={{}} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("sPyNNaker version"), { target: { value: "6.0.0" } });
    expect(onChange).toHaveBeenCalledWith({ spynnaker_version: "6.0.0" });
  });

  test("parses extra Python packages into an array", () => {
    const onChange = vi.fn();
    render(<SpiNNakerConfig config={{}} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("Extra Python packages to install"), {
      target: { value: "a,b" },
    });
    expect(onChange).toHaveBeenCalledWith({ extra_pip_installs: ["a", "b"] });
  });
});
