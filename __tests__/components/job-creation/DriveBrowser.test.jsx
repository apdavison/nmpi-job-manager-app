/* global fetchMock */
import { describe, test, beforeEach } from "vitest";
import { render } from "@testing-library/react";

import DriveBrowser from "../../../src/components/job-creation/DriveBrowser";
import { AuthContext } from "../../../src/context";

describe("DriveBrowser", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    fetchMock.mockResponses(
      [JSON.stringify([{ id: "repo-1", group_name: "collab-test-collab-drive" }])],
      [JSON.stringify([])]
    );
  });

  test("placeholder", () => {
    render(
      <AuthContext.Provider value={{ token: "foo" }}>
        <DriveBrowser collab="test-collab" />
      </AuthContext.Provider>
    );
  });
});
