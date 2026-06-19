import { describe, expect, test, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";

import FileBrowser from "../../../src/components/job-creation/FileBrowser";
import type { DriveEntry } from "../../../src/components/job-creation/DriveBrowser";

const file: DriveEntry = {
  id: "f1",
  name: "results.pkl",
  type: "file",
  path: "",
  size: 2048,
  mtime: 1700000000,
};
const dir = {
  id: "d1",
  name: "subdir",
  type: "dir",
  path: "",
  size: "",
  mtime: 1700000000,
} as unknown as DriveEntry;

describe("FileBrowser", () => {
  test("shows a progress indicator while loading", () => {
    render(
      <FileBrowser
        loading={true}
        path=""
        contents={[]}
        onChangePath={vi.fn()}
        onSetSelected={vi.fn()}
      />
    );
    expect(screen.getByRole("progressbar")).toBeDefined();
  });

  test("renders the column headers and the item names once loaded", () => {
    render(
      <FileBrowser
        loading={false}
        path=""
        contents={[file, dir]}
        onChangePath={vi.fn()}
        onSetSelected={vi.fn()}
      />
    );

    expect(screen.getByText("Name")).toBeDefined();
    expect(screen.getByText("Size")).toBeDefined();
    expect(screen.getByText("Last Update")).toBeDefined();
    expect(screen.getByText("results.pkl")).toBeDefined();
    expect(screen.getByText("subdir")).toBeDefined();
  });

  test("clicking a directory's folder icon selects its path", () => {
    const onSetSelected = vi.fn();
    render(
      <FileBrowser
        loading={false}
        path=""
        contents={[dir]}
        onChangePath={vi.fn()}
        onSetSelected={onSetSelected}
      />
    );

    const row = screen.getByRole("link", { name: "subdir" }).closest("tr");
    fireEvent.click(within(row!).getByRole("button"));
    expect(onSetSelected).toHaveBeenCalledWith("subdir");
  });

  test("clicking a directory name navigates into it", () => {
    const onChangePath = vi.fn();
    render(
      <FileBrowser
        loading={false}
        path=""
        contents={[dir]}
        onChangePath={onChangePath}
        onSetSelected={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("link", { name: "subdir" }));
    expect(onChangePath).toHaveBeenCalledWith("subdir");
  });
});
