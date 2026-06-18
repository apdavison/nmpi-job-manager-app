import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

import Toolbar from "../../../src/components/general/Toolbar";
import { RequestedCollabContext } from "../../../src/context";

function renderToolbar(props) {
  return render(
    <RequestedCollabContext.Provider value={null}>
      <BrowserRouter>
        <Toolbar {...props} />
      </BrowserRouter>
    </RequestedCollabContext.Provider>
  );
}

const SERVICE_TITLE = "EBRAINS Neuromorphic Computing Service: Job Manager";

describe("Toolbar", () => {
  test("links the service title to the home page", () => {
    renderToolbar({ page: "jobs", collab: "my-collab" });
    expect(screen.getByRole("link", { name: SERVICE_TITLE }).getAttribute("href")).toEqual("/");
  });

  test("on the jobs page, shows the collab and the Quotas / New job links", () => {
    renderToolbar({ page: "jobs", collab: "my-collab" });

    expect(screen.getByText("my-collab")).toBeDefined();
    expect(screen.getByRole("link", { name: "Quotas" }).getAttribute("href")).toEqual(
      "/my-collab/projects/"
    );
    expect(screen.getByRole("link", { name: "New job" }).getAttribute("href")).toEqual(
      "/my-collab/jobs/new"
    );
  });

  test("an unknown page renders only the service title", () => {
    renderToolbar({ page: "something-else", collab: "my-collab" });

    expect(screen.getByRole("link", { name: SERVICE_TITLE })).toBeDefined();
    expect(screen.queryByRole("link", { name: "Quotas" })).toBeNull();
    expect(screen.queryByRole("link", { name: "New job" })).toBeNull();
  });
});
