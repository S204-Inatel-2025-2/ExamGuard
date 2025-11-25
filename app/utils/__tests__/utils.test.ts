import { describe, it, expect } from "vitest";
import { getLoginErrorMessageFromStatus } from "../utils";

describe("getLoginErrorMessageFromStatus", () => {
  it("returns correct message for 500 status", () => {
    const message = getLoginErrorMessageFromStatus(500);
    expect(message).toBe("Erro desconhecido. Contate o suporte.");
  });

  it("returns correct message for 401 status", () => {
    const message = getLoginErrorMessageFromStatus(401);
    expect(message).toBe(
      "Suas credenciais não batem com nenhuma dos nossos servidores. Tente novamente.",
    );
  });

  it("returns default message for unknown status", () => {
    const message = getLoginErrorMessageFromStatus(404);
    expect(message).toBe("Unknown error. Please contact support.");
  });
});
