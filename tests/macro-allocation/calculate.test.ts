import { describe, expect, it } from "vitest";

import { calculateMacroAllocation } from "@/lib/macro-allocation/calculate";
import type { MacroAllocationFormState } from "@/lib/macro-allocation/types";

const BASE_STATE: MacroAllocationFormState = {
  depositAmount: 20,
  currentValues: {
    rendaFixa: 80,
    fiis: 10,
    acoes: 10,
  },
  targetAllocationPct: {
    rendaFixa: 40,
    fiis: 30,
    acoes: 30,
  },
  depositMode: "depositOnly",
  maxSellAmount: 0,
};

function expectInvariantSumMatchesDeposit(state: MacroAllocationFormState) {
  const result = calculateMacroAllocation(state);
  const sumMovements =
    result.netMovements.rendaFixa + result.netMovements.fiis + result.netMovements.acoes;

  expect(sumMovements).toBeCloseTo(state.depositAmount, 6);
}

function expectInvariantNoNegativeFinalValues(state: MacroAllocationFormState) {
  const result = calculateMacroAllocation(state);

  expect(result.finalValues.rendaFixa).toBeGreaterThanOrEqual(0);
  expect(result.finalValues.fiis).toBeGreaterThanOrEqual(0);
  expect(result.finalValues.acoes).toBeGreaterThanOrEqual(0);
}

describe("calculateMacroAllocation", () => {
  it("deve cumprir invariantes de soma e não negatividade", () => {
    expectInvariantSumMatchesDeposit(BASE_STATE);
    expectInvariantNoNegativeFinalValues(BASE_STATE);
  });

  it("deve tratar depositOnly como rebalance com máximo de venda igual a zero", () => {
    const depositOnly = calculateMacroAllocation({
      ...BASE_STATE,
      depositMode: "depositOnly",
      maxSellAmount: 999,
    });

    const rebalanceWithZeroSell = calculateMacroAllocation({
      ...BASE_STATE,
      depositMode: "rebalance",
      maxSellAmount: 0,
    });

    expect(depositOnly.netMovements.rendaFixa).toBeCloseTo(
      rebalanceWithZeroSell.netMovements.rendaFixa,
      6,
    );
    expect(depositOnly.netMovements.fiis).toBeCloseTo(
      rebalanceWithZeroSell.netMovements.fiis,
      6,
    );
    expect(depositOnly.netMovements.acoes).toBeCloseTo(
      rebalanceWithZeroSell.netMovements.acoes,
      6,
    );
  });

  it("deve atingir a meta no rebalance quando o limite de venda é suficiente", () => {
    const state: MacroAllocationFormState = {
      ...BASE_STATE,
      depositAmount: 0,
      depositMode: "rebalance",
      maxSellAmount: 100,
    };

    const result = calculateMacroAllocation(state);

    expect(result.reachedTarget).toBe(true);
    expect(result.finalValues.rendaFixa).toBeCloseTo(40, 6);
    expect(result.finalValues.fiis).toBeCloseTo(30, 6);
    expect(result.finalValues.acoes).toBeCloseTo(30, 6);
  });

  it("deve respeitar teto de venda no rebalance e sinalizar restrição", () => {
    const result = calculateMacroAllocation({
      ...BASE_STATE,
      depositMode: "rebalance",
      maxSellAmount: 10,
    });

    expect(result.totalSellAmount).toBeCloseTo(10, 6);
    expect(result.isSellConstrained).toBe(true);
    expect(result.reachedTarget).toBe(false);
    expectInvariantSumMatchesDeposit({
      ...BASE_STATE,
      depositMode: "rebalance",
      maxSellAmount: 10,
    });
  });

  it("deve normalizar a meta quando percentuais não somam 100", () => {
    const result = calculateMacroAllocation({
      ...BASE_STATE,
      depositAmount: 0,
      depositMode: "rebalance",
      maxSellAmount: 100,
      targetAllocationPct: {
        rendaFixa: 2,
        fiis: 1,
        acoes: 1,
      },
    });

    expect(result.normalizedTargetWeights.rendaFixa).toBeCloseTo(0.5, 6);
    expect(result.normalizedTargetWeights.fiis).toBeCloseTo(0.25, 6);
    expect(result.normalizedTargetWeights.acoes).toBeCloseTo(0.25, 6);
    expect(result.reachedTarget).toBe(true);
  });
});