import { render } from "@testing-library/react";
import { Toaster } from "../sonner";
import { expect, test, describe, vi } from "vitest";

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light" }),
}));

vi.mock("~/hooks/use-mounted", () => ({
  useMounted: () => true,
}));

describe("Toaster", () => {
  test("renders without crashing", () => {
    const { container } = render(<Toaster />);
    expect(container).toBeInTheDocument();
  });
});
