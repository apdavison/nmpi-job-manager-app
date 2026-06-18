/* global fetchMock */
import { describe, expect, test, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

import DriveBrowser from "../../../src/components/job-creation/DriveBrowser";
import { AuthContext } from "../../../src/context";

describe("DriveBrowser", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    fetchMock.mockResponses(
      // first call: the list of repos (one matching the collab)
      [JSON.stringify([{ id: "repo-1", group_name: "collab-test-collab-drive" }])],
      // second call: the contents of that repo (one file)
      [
        JSON.stringify([
          { id: "file-1", name: "script.py", type: "file", size: 1234, mtime: 1700000000 },
        ]),
      ]
    );
  });

  test("shows a progress indicator, then the loaded file", async () => {
    render(
      <AuthContext.Provider value={{ token: "foo" }}>
        <DriveBrowser collab="test-collab" />
      </AuthContext.Provider>
    );

    expect(screen.getByRole("progressbar")).toBeDefined();
    expect(await screen.findByText("script.py")).toBeDefined();
  });
});
