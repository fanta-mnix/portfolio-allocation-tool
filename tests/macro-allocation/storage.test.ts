// @vitest-environment jsdom

import { describe, expect, it, beforeEach } from "vitest";

import {
  DEFAULT_MACRO_ALLOCATION_STATE,
  MACRO_ALLOCATION_SNAPSHOT_VERSION,
  MACRO_ALLOCATION_STORAGE_KEY,
} from "@/lib/macro-allocation/defaults";
import {
  loadMacroAllocationState,
  saveMacroAllocationState,
} from "@/lib/macro-allocation/storage";
import type { MacroAllocationFormState } from "@/lib/macro-allocation/types";

const CUSTOM_STATE: MacroAllocationFormState = {
  depositAmount: 1500.75,
  currentValues: {
    rendaFixa: 10000,
    fiis: 5000,
    acoes: 2500,
  },
  targetAllocationPct: {
    rendaFixa: 50,
    fiis: 30,
    acoes: 20,
  },
  depositMode: "rebalance",
  maxSellAmount: 800,
};

describe("storage macro allocation", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("deve salvar snapshot versionado no localStorage", () => {
    saveMacroAllocationState(CUSTOM_STATE);

    const rawSnapshot = window.localStorage.getItem(MACRO_ALLOCATION_STORAGE_KEY);

    expect(rawSnapshot).not.toBeNull();
    expect(rawSnapshot).toContain(`"version":${MACRO_ALLOCATION_SNAPSHOT_VERSION}`);
  });

  it("deve carregar estado salvo válido", () => {
    saveMacroAllocationState(CUSTOM_STATE);

    const loadedState = loadMacroAllocationState();

    expect(loadedState).toEqual(CUSTOM_STATE);
  });

  it("deve retornar estado padrão quando snapshot estiver inválido", () => {
    window.localStorage.setItem(MACRO_ALLOCATION_STORAGE_KEY, "{invalid-json}");

    const loadedState = loadMacroAllocationState();

    expect(loadedState).toEqual(DEFAULT_MACRO_ALLOCATION_STATE);
  });

  it("deve retornar estado padrão quando versão for incompatível", () => {
    window.localStorage.setItem(
      MACRO_ALLOCATION_STORAGE_KEY,
      JSON.stringify({
        version: 999,
        state: CUSTOM_STATE,
      }),
    );

    const loadedState = loadMacroAllocationState();

    expect(loadedState).toEqual(DEFAULT_MACRO_ALLOCATION_STATE);
  });

  it("deve retornar estado padrão quando payload tiver campos inválidos", () => {
    window.localStorage.setItem(
      MACRO_ALLOCATION_STORAGE_KEY,
      JSON.stringify({
        version: MACRO_ALLOCATION_SNAPSHOT_VERSION,
        state: {
          ...CUSTOM_STATE,
          depositAmount: -10,
        },
      }),
    );

    const loadedState = loadMacroAllocationState();

    expect(loadedState).toEqual(DEFAULT_MACRO_ALLOCATION_STATE);
  });
});