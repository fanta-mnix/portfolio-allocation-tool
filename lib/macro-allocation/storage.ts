import {
  DEFAULT_MACRO_ALLOCATION_STATE,
  MACRO_ALLOCATION_SNAPSHOT_VERSION,
  MACRO_ALLOCATION_STORAGE_KEY,
} from "./defaults";
import { ASSET_CLASSES, type MacroAllocationFormState } from "./types";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function parseNonNegativeNumber(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return null;
  }

  return value;
}

function parseNumericMap(value: unknown): Record<(typeof ASSET_CLASSES)[number], number> | null {
  if (!isRecord(value)) {
    return null;
  }

  const parsed = {
    rendaFixa: 0,
    fiis: 0,
    acoes: 0,
  };

  for (const assetClass of ASSET_CLASSES) {
    const numericValue = parseNonNegativeNumber(value[assetClass]);

    if (numericValue === null) {
      return null;
    }

    parsed[assetClass] = numericValue;
  }

  return parsed;
}

function parseState(value: unknown): MacroAllocationFormState | null {
  if (!isRecord(value)) {
    return null;
  }

  const depositAmount = parseNonNegativeNumber(value.depositAmount);
  const maxSellAmount = parseNonNegativeNumber(value.maxSellAmount);
  const currentValues = parseNumericMap(value.currentValues);
  const targetAllocationPct = parseNumericMap(value.targetAllocationPct);
  const depositMode = value.depositMode;

  if (
    depositAmount === null ||
    maxSellAmount === null ||
    currentValues === null ||
    targetAllocationPct === null ||
    (depositMode !== "depositOnly" && depositMode !== "rebalance")
  ) {
    return null;
  }

  return {
    depositAmount,
    currentValues,
    targetAllocationPct,
    depositMode,
    maxSellAmount,
  };
}

export function loadMacroAllocationState(): MacroAllocationFormState {
  if (typeof window === "undefined") {
    return DEFAULT_MACRO_ALLOCATION_STATE;
  }

  const rawSnapshot = window.localStorage.getItem(MACRO_ALLOCATION_STORAGE_KEY);

  if (!rawSnapshot) {
    return DEFAULT_MACRO_ALLOCATION_STATE;
  }

  try {
    const parsedSnapshot = JSON.parse(rawSnapshot) as unknown;

    if (!isRecord(parsedSnapshot)) {
      return DEFAULT_MACRO_ALLOCATION_STATE;
    }

    if (parsedSnapshot.version !== MACRO_ALLOCATION_SNAPSHOT_VERSION) {
      return DEFAULT_MACRO_ALLOCATION_STATE;
    }

    const parsedState = parseState(parsedSnapshot.state);

    return parsedState ?? DEFAULT_MACRO_ALLOCATION_STATE;
  } catch {
    return DEFAULT_MACRO_ALLOCATION_STATE;
  }
}

export function saveMacroAllocationState(state: MacroAllocationFormState): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    MACRO_ALLOCATION_STORAGE_KEY,
    JSON.stringify({
      version: MACRO_ALLOCATION_SNAPSHOT_VERSION,
      state,
    }),
  );
}