import type { AssetClassValues, MacroAllocationFormState } from "./types";

export const MACRO_ALLOCATION_STORAGE_KEY = "macro-allocation:snapshot";
export const MACRO_ALLOCATION_SNAPSHOT_VERSION = 1;

export const ASSET_CLASS_LABELS: Record<keyof AssetClassValues, string> = {
  rendaFixa: "Renda Fixa",
  fiis: "FIIs",
  acoes: "Ações",
};

export const DEFAULT_MACRO_ALLOCATION_STATE: MacroAllocationFormState = {
  depositAmount: 0,
  currentValues: {
    rendaFixa: 0,
    fiis: 0,
    acoes: 0,
  },
  targetAllocationPct: {
    rendaFixa: 40,
    fiis: 30,
    acoes: 30,
  },
  depositMode: "depositOnly",
  maxSellAmount: 0,
};