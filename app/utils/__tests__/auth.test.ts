import { describe, it, expect, beforeEach } from "vitest";
import { auth } from "../auth";

describe("auth utils", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("getToken returns null if no token in localStorage", () => {
    expect(auth.getToken()).toBeNull();
  });

  it("getToken returns token if set in localStorage", () => {
    localStorage.setItem("token", "test-token");
    expect(auth.getToken()).toBe("test-token");
  });

  it("setToken sets token in localStorage", () => {
    auth.setToken("new-token");
    expect(localStorage.getItem("token")).toBe("new-token");
  });

  it("removeToken removes token from localStorage", () => {
    localStorage.setItem("token", "token-to-remove");
    auth.removeToken();
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("isAuthenticated returns false if no token", () => {
    expect(auth.isAuthenticated()).toBe(false);
  });

  it("isAuthenticated returns true if token exists", () => {
    localStorage.setItem("token", "valid-token");
    expect(auth.isAuthenticated()).toBe(true);
  });
});
