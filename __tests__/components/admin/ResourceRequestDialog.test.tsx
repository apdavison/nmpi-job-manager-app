import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import ResourceRequestDialog from "../../../src/components/admin/ResourceRequestDialog";
import type { Auth } from "../../../src/types";
import { makeResourceRequest } from "../../fixtures";

const auth: Auth = { token: "t" };

describe("ResourceRequestDialog", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it("shows the review actions for an 'under review' request", () => {
    const rr = makeResourceRequest({ status: "under review" });
    render(<ResourceRequestDialog auth={auth} open onClose={vi.fn()} resourceRequest={rr} />);

    expect(screen.getByRole("button", { name: "Reject" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Accept with Requested Quotas" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Accept but Set Different Quotas" })).toBeTruthy();
  });

  it("shows the 'Add quota' action for an accepted request", () => {
    const rr = makeResourceRequest({ status: "accepted" });
    render(<ResourceRequestDialog auth={auth} open onClose={vi.fn()} resourceRequest={rr} />);

    expect(screen.getByRole("button", { name: "Add quota" })).toBeTruthy();
  });

  it("posts a quota and closes when a valid limit is added", async () => {
    fetchMock.mockResponseOnce("", { status: 201 });
    const onClose = vi.fn();
    const rr = makeResourceRequest({ status: "accepted" });
    render(<ResourceRequestDialog auth={auth} open onClose={onClose} resourceRequest={rr} />);

    fireEvent.click(screen.getByRole("button", { name: "Add quota" }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(fetchMock.mock.calls.length).toBe(1);
  });

  it("does not post a quota when the limit is not a number", () => {
    const onClose = vi.fn();
    const rr = makeResourceRequest({ status: "accepted" });
    render(<ResourceRequestDialog auth={auth} open onClose={onClose} resourceRequest={rr} />);

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "abc" } });
    fireEvent.click(screen.getByRole("button", { name: "Add quota" }));

    expect(fetchMock.mock.calls.length).toBe(0);
    expect(onClose).not.toHaveBeenCalled();
  });

  // Regression test for the original admin-app bug: with the default "under review"
  // filter matching nothing, the table passes `filtered[0]` (undefined) to the dialog.
  // The dialog must render nothing rather than throw on the missing request.
  it("renders nothing (and does not throw) when no resource request is given", () => {
    const { container } = render(
      <ResourceRequestDialog auth={auth} open onClose={vi.fn()} resourceRequest={undefined} />
    );

    expect(container.firstChild).toBeNull();
  });

  it("does not mutate the resource request when editing the description", () => {
    const rr = makeResourceRequest({ status: "under review", description: "original" });
    render(<ResourceRequestDialog auth={auth} open onClose={vi.fn()} resourceRequest={rr} />);

    fireEvent.change(screen.getByLabelText("Description"), { target: { value: "edited text" } });

    expect(rr.description).toBe("original");
  });
});
