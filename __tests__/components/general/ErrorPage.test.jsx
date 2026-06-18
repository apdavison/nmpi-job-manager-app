import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

import ErrorPage from "../../../src/components/general/ErrorPage";

describe("ErrorPage", () => {
  test("renders the error heading and the error detail", async () => {
    const router = createMemoryRouter(
      [
        {
          path: "/",
          element: <div />,
          loader: () => {
            throw new Error("boom");
          },
          errorElement: <ErrorPage />,
        },
      ],
      { initialEntries: ["/"] }
    );

    render(<RouterProvider router={router} />);

    expect(await screen.findByRole("heading", { name: "Unexpected error" })).toBeDefined();
    expect(screen.getByText(/Error detail: boom/)).toBeDefined();
  });
});
