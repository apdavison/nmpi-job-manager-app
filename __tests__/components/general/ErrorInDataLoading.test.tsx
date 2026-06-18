import { Suspense } from "react";
import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Await, createMemoryRouter, defer, RouterProvider } from "react-router-dom";

import ErrorInDataLoading from "../../../src/components/general/ErrorInDataLoading";

function DeferredError({ error }: { error: Error }) {
  return (
    <Suspense fallback={<p>loading</p>}>
      <Await resolve={Promise.reject(error)} errorElement={<ErrorInDataLoading />}>
        {() => null}
      </Await>
    </Suspense>
  );
}

describe("ErrorInDataLoading", () => {
  test("displays error message", async () => {
    const router = createMemoryRouter(
      [
        {
          path: "/",
          loader: () => defer({ data: Promise.resolve(null) }),
          element: <DeferredError error={new Error("something went wrong")} />,
        },
      ],
      { initialEntries: ["/"] }
    );
    render(<RouterProvider router={router} />);
    expect(await screen.findByText(/something went wrong/)).toBeTruthy();
  });
});
