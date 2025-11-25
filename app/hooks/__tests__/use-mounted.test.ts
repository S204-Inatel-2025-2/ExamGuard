import { renderHook, waitFor } from "@testing-library/react";
import { useMounted } from "../use-mounted";
import { describe, it, expect } from "vitest";

describe("useMounted", () => {
  it("should return false initially and true after mount", async () => {
    const { result } = renderHook(() => useMounted());

    expect(result.current).toBe(true);

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });
});
