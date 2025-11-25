import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { ProtectedRoute } from "../ProtectedRoute";
import { auth } from "~/utils/auth";
import { expect, test, describe, vi, beforeEach } from "vitest";

vi.mock("~/utils/auth", () => ({
  auth: {
    isAuthenticated: vi.fn(),
  },
}));

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders children when authenticated", () => {
    (auth.isAuthenticated as any).mockReturnValue(true); // eslint-disable-line @typescript-eslint/no-explicit-any

    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  test("redirects to login when not authenticated", () => {
    (auth.isAuthenticated as any).mockReturnValue(false); // eslint-disable-line @typescript-eslint/no-explicit-any

    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Login Page")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });
});
