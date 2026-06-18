import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

import CollabList from "../../../src/components/home/CollabList";
import { StatusContext } from "../../../src/context";

// CollabList reads server status from StatusContext and uses RouterLink, so it
// must be wrapped in both a status provider and a router.
function renderCollabList(collabs, status = "ok") {
  return render(
    <StatusContext.Provider value={status}>
      <BrowserRouter>
        <CollabList collabs={collabs} />
      </BrowserRouter>
    </StatusContext.Provider>
  );
}

describe("CollabList", () => {
  test("renders a card with navigation links for each collab", () => {
    renderCollabList(["alpha-collab", "beta-collab"]);

    expect(screen.getByRole("heading", { name: "alpha-collab" })).toBeDefined();
    expect(screen.getByRole("heading", { name: "beta-collab" })).toBeDefined();

    const jobsLinks = screen.getAllByRole("link", { name: "Jobs" });
    expect(jobsLinks).toHaveLength(2);
    expect(jobsLinks[0].getAttribute("href")).toContain("alpha-collab/jobs/");
  });

  test("the Quotas link points to the projects route", () => {
    renderCollabList(["alpha-collab"]);
    const quotasLink = screen.getByRole("link", { name: "Quotas" });
    expect(quotasLink.getAttribute("href")).toContain("alpha-collab/projects/");
  });

  test("enables the Jobs link when the server is ok", () => {
    renderCollabList(["alpha-collab"], "ok");
    expect(screen.getByRole("link", { name: "Jobs" }).getAttribute("aria-disabled")).not.toBe(
      "true"
    );
  });

  test("disables navigation when the server is down", () => {
    renderCollabList(["alpha-collab"], "down");
    expect(screen.getByRole("link", { name: "Jobs" }).getAttribute("aria-disabled")).toBe("true");
    expect(screen.getByRole("link", { name: "Quotas" }).getAttribute("aria-disabled")).toBe(
      "true"
    );
  });
});
