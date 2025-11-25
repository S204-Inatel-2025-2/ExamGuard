import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import LandingPageNavbar from "../landing-page-navbar";
import { expect, test, describe, vi } from "vitest";

vi.mock("~/hooks/use-mounted", () => ({
  useMounted: () => true,
}));

describe("LandingPageNavbar", () => {
  test("renders branding and desktop navigation", () => {
    render(<LandingPageNavbar />, { wrapper: MemoryRouter });
    expect(screen.getByText("ExamGuard")).toBeInTheDocument();
    const desktopButtons = screen.getAllByText(/entrar|cadastro/i);
    expect(desktopButtons.length).toBeGreaterThan(0);
  });
});
