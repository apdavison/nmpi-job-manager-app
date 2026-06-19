import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import ResourceRequestTable from "../../../src/components/admin/ResourceRequestTable";
import { makeResourceRequest, resourceRequests } from "../../fixtures";

describe("ResourceRequestTable", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    fetchMock.mockResponse(JSON.stringify(resourceRequests));
  });

  it("shows requests with the default 'under review' status filter", async () => {
    render(<ResourceRequestTable auth={{ token: "t" }} />);

    expect(await screen.findByText("Under review project")).toBeTruthy();
    expect(screen.queryByText("Accepted project")).toBeNull();
    expect(screen.queryByText("Rejected project")).toBeNull();
  });

  it("switches the visible requests when another status filter is selected", async () => {
    render(<ResourceRequestTable auth={{ token: "t" }} />);
    await screen.findByText("Under review project");

    fireEvent.click(screen.getByRole("button", { name: "accepted" }));

    expect(await screen.findByText("Accepted project")).toBeTruthy();
    expect(screen.queryByText("Under review project")).toBeNull();
  });

  // Regression test for the original admin-app bug: when the default "under review"
  // filter matches no requests, the dialog is mounted with an undefined selection. The
  // table (and the dialog it renders) must still render rather than crash.
  it("renders without crashing when no requests match the default filter", async () => {
    const noUnderReview = [
      makeResourceRequest({ title: "Accepted project", status: "accepted", resource_uri: "/p/a" }),
      makeResourceRequest({ title: "Rejected project", status: "rejected", resource_uri: "/p/b" }),
    ];
    fetchMock.mockResponse(JSON.stringify(noUnderReview));
    render(<ResourceRequestTable auth={{ token: "t" }} />);

    // The filter bar appears even though the default-filtered list is empty, and switching
    // to "accepted" reveals a request — proving the table rendered rather than crashed.
    fireEvent.click(await screen.findByRole("button", { name: "accepted" }));
    expect(await screen.findByText("Accepted project")).toBeTruthy();
  });

  // The empty list must be distinguishable from "still loading": once the (empty)
  // response arrives, show an empty-state message rather than spinning forever.
  it("shows an empty-state message (not a perpetual spinner) when there are no requests", async () => {
    fetchMock.mockResponse(JSON.stringify([]));
    render(<ResourceRequestTable auth={{ token: "t" }} />);

    expect(await screen.findByText("No under review resource requests")).toBeTruthy();
    expect(screen.queryByRole("progressbar")).toBeNull();
  });

  it("shows a per-category message when the selected category has no requests", async () => {
    // The default fixture has no "in preparation" requests.
    render(<ResourceRequestTable auth={{ token: "t" }} />);
    await screen.findByText("Under review project");

    fireEvent.click(screen.getByRole("button", { name: "in preparation" }));

    expect(await screen.findByText("No in preparation resource requests")).toBeTruthy();
  });

  it("filters the visible requests by the search field", async () => {
    render(<ResourceRequestTable auth={{ token: "t" }} />);
    await screen.findByText("Under review project");

    fireEvent.change(screen.getByLabelText("Search"), { target: { value: "nomatch" } });

    expect(screen.queryByText("Under review project")).toBeNull();
  });
});
