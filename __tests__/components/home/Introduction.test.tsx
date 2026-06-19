import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";

import Introduction from "../../../src/components/home/Introduction";

describe("Introduction", () => {
  test("shows the main heading", () => {
    render(<Introduction />);
    expect(
      screen.getByRole("heading", { name: "Neuromorphic computing in EBRAINS" })
    ).toBeDefined();
  });

  test("links 'Getting started' and 'Documentation' to their external pages", () => {
    render(<Introduction />);

    const gettingStarted = screen.getByRole("link", { name: "Getting started" });
    expect(gettingStarted.getAttribute("href")).toEqual(
      "https://www.ebrains.eu/modelling-simulation-and-computing/simulation/neuromorphic-computing-3"
    );

    const documentation = screen.getByRole("link", { name: "Documentation" });
    expect(documentation.getAttribute("href")).toEqual(
      "https://electronicvisions.github.io/hbp-sp9-guidebook"
    );
  });
});
