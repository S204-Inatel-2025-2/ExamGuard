import { render, screen } from "@testing-library/react";
import { Skeleton } from "../skeleton";
import { expect, test, describe } from "vitest";

describe("Skeleton", () => {
  test("renders skeleton", () => {
    render(<Skeleton data-testid="skeleton" className="h-4 w-4" />);
    const skeleton = screen.getByTestId("skeleton");
    expect(skeleton).toHaveClass("animate-pulse rounded-md bg-muted h-4 w-4");
  });
});
