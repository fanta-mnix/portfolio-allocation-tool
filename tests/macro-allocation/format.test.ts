import { describe, expect, it } from "vitest";

import {
  formatCurrencyBR,
  formatDecimalBR,
  formatPercentBR,
  parsePtBrNumber,
} from "@/lib/macro-allocation/format";

describe("formatadores pt-BR", () => {
  it("deve formatar moeda no padrão brasileiro", () => {
    expect(formatCurrencyBR(1230.99)).toBe("R$ 1.230,99");
  });

  it("deve formatar decimal no padrão brasileiro", () => {
    expect(formatDecimalBR(45.5)).toBe("45,50");
  });

  it("deve formatar percentual no padrão brasileiro", () => {
    expect(formatPercentBR(12.345)).toBe("12,35%");
  });
});

describe("parsePtBrNumber", () => {
  it("deve aceitar vírgula como separador decimal", () => {
    expect(parsePtBrNumber("1.230,99")).toBeCloseTo(1230.99, 6);
  });

  it("deve aceitar valores com prefixo de moeda", () => {
    expect(parsePtBrNumber("R$ 10,50")).toBeCloseTo(10.5, 6);
  });

  it("deve retornar null para conteúdo inválido", () => {
    expect(parsePtBrNumber("abc")).toBeNull();
  });
});