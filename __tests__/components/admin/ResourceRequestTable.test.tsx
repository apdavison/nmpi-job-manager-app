import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import ResourceRequestTable from "../../../src/components/admin/ResourceRequestTable";
import { resourceRequests } from "../../fixtures";

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

  it("filters the visible requests by the search field", async () => {
    render(<ResourceRequestTable auth={{ token: "t" }} />);
    await screen.findByText("Under review project");

    fireEvent.change(screen.getByLabelText("Search"), { target: { value: "nomatch" } });

    expect(screen.queryByText("Under review project")).toBeNull();
  });
});
