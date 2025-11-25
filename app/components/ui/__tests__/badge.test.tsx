import { render, screen } from "@testing-library/react";
import { Badge } from "../badge";
import { expect, test, describe } from "vitest";

describe("Badge", () => {
  test("renders default badge", () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText("Default");
    expect(badge).toHaveClass("bg-primary text-primary-foreground");
  });

  test("renders secondary badge", () => {
    render(<Badge variant="secondary">Secondary</Badge>);
    const badge = screen.getByText("Secondary");
    expect(badge).toHaveClass("bg-secondary text-secondary-foreground");
  });

  test("renders destructive badge", () => {
    render(<Badge variant="destructive">Destructive</Badge>);
    const badge = screen.getByText("Destructive");
    expect(badge).toHaveClass("bg-destructive text-white");
  });

  test("renders outline badge", () => {
    render(<Badge variant="outline">Outline</Badge>);
    const badge = screen.getByText("Outline");
    expect(badge).toHaveClass("text-foreground");
  });
});
