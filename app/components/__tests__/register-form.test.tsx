import { render, screen, fireEvent } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { RegisterForm } from "../register-form";
import { expect, test, describe, vi } from "vitest";

describe("RegisterForm", () => {
  const setAuthStateMock = vi.fn();

  const renderComponent = () => {
    const router = createMemoryRouter([
      {
        path: "/",
        element: <RegisterForm setAuthState={setAuthStateMock} />,
      },
    ]);
    render(<RouterProvider router={router} />);
  };

  test("renders register form elements", () => {
    renderComponent();
    expect(
      screen.getByRole("heading", { name: /create an account/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create account/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
  });

  test("switches to login state when Sign in is clicked", () => {
    renderComponent();
    const signInButton = screen.getByText(/sign in/i);
    fireEvent.click(signInButton);
    expect(setAuthStateMock).toHaveBeenCalledWith({ state: "login" });
  });
});
