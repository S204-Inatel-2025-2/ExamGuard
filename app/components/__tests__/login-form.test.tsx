import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "../login-form";
import { expect, test, describe, vi } from "vitest";
import { createMemoryRouter, RouterProvider } from "react-router";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const router = (onSubmit: any) =>
  createMemoryRouter([
    {
      path: "/",
      element: <LoginForm setAuthState={() => {}} onSubmit={onSubmit} />,
      action: onSubmit,
    },
  ]);

describe("LoginForm", () => {
  test("Renders all required elements", () => {
    render(<RouterProvider router={router(vi.fn())} />);

    expect(
      screen.getByRole("heading", { name: /login to your account/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/m@example.com/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^Login$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /forgot your password/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /login with github/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign up/i }),
    ).toBeInTheDocument();
  });

  test('"Forgot your password?" link navigates correctly', () => {
    render(<RouterProvider router={router(vi.fn())} />);
    const forgotPasswordLink = screen.getByRole("link", {
      name: /forgot your password/i,
    });
    expect(forgotPasswordLink).toHaveAttribute("href", "#");
  });

  test('"Login with GitHub" button has SVG icon', () => {
    render(<RouterProvider router={router(vi.fn())} />);
    const githubButton = screen.getByRole("button", {
      name: /login with github/i,
    });
    expect(githubButton).toBeInTheDocument();
    expect(githubButton.querySelector("svg")).toBeInTheDocument();
  });

  test('"Sign up" button works', async () => {
    const setAuthState = vi.fn();
    const signUpRouter = createMemoryRouter([
      { path: "/", element: <LoginForm setAuthState={setAuthState} /> },
    ]);
    render(<RouterProvider router={signUpRouter} />);
    const signUpButton = screen.getByRole("button", { name: /sign up/i });
    await userEvent.click(signUpButton);
    expect(setAuthState).toHaveBeenCalledWith({ state: "register" });
  });

  test("Form submission with empty fields (required validation)", async () => {
    const handleSubmit = vi.fn((e) => e.preventDefault());
    render(<RouterProvider router={router(handleSubmit)} />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole("button", { name: /^Login$/i });

    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();

    await userEvent.click(loginButton);

    expect(handleSubmit).not.toHaveBeenCalled();
  });
});
