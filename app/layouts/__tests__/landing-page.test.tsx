import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import LandingPageLayout from "../landing-page";
import { expect, test, describe, vi } from "vitest";

vi.mock("~/components/landing-page-navbar", () => ({
  default: () => <div data-testid="mock-navbar">Landing Page Navbar</div>,
}));

vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router")>();
  return {
    ...actual,
    Outlet: () => <div data-testid="mock-outlet">Outlet Content</div>,
  };
});

describe("LandingPageLayout", () => {
  test("renders navbar and outlet", () => {
    render(<LandingPageLayout />, { wrapper: MemoryRouter });
    expect(screen.getByTestId("mock-navbar")).toBeInTheDocument();
    expect(screen.getByTestId("mock-outlet")).toBeInTheDocument();
  });
});
