import { describe, expect, test, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import BrainScaleSConfig from "../../../src/components/job-creation/BrainScaleSConfig";

describe("BrainScaleSConfig", () => {
  test("reports the wafer module as an integer", () => {
    const onChange = vi.fn();
    render(<BrainScaleSConfig config={{}} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("Wafer module"), { target: { value: "3" } });
    expect(onChange).toHaveBeenCalledWith({ WAFER_MODULE: 3 });
  });

  test("parses the HICANN field into an array of integers", () => {
    const onChange = vi.fn();
    render(<BrainScaleSConfig config={{}} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("HICANN"), { target: { value: "1,2" } });
    expect(onChange).toHaveBeenCalledWith({ HICANN: [1, 2] });
  });

  test("passes the software version through as a string", () => {
    const onChange = vi.fn();
    render(<BrainScaleSConfig config={{}} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("Software version"), { target: { value: "v1.2" } });
    expect(onChange).toHaveBeenCalledWith({ SOFTWARE_VERSION: "v1.2" });
  });
});
