"use client";

import { useEffect, useState } from "react";

import { DEFAULT_MACRO_ALLOCATION_STATE } from "@/lib/macro-allocation/defaults";
import {
  loadMacroAllocationState,
  saveMacroAllocationState,
} from "@/lib/macro-allocation/storage";
import { ASSET_CLASSES, type AssetClassKey, type DepositMode } from "@/lib/macro-allocation/types";

function clampNonNegative(value: number): number {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }

  return value;
}

export function useMacroAllocationState() {
  const [state, setState] = useState(() => loadMacroAllocationState());

  useEffect(() => {
    saveMacroAllocationState(state);
  }, [state]);

  function updateDepositAmount(nextValue: number) {
    setState((previousState) => ({
      ...previousState,
      depositAmount: clampNonNegative(nextValue),
    }));
  }

  function updateMaxSellAmount(nextValue: number) {
    setState((previousState) => ({
      ...previousState,
      maxSellAmount: clampNonNegative(nextValue),
    }));
  }

  function updateDepositMode(nextValue: DepositMode) {
    setState((previousState) => ({
      ...previousState,
      depositMode: nextValue,
    }));
  }

  function updateCurrentValue(assetClass: AssetClassKey, nextValue: number) {
    setState((previousState) => ({
      ...previousState,
      currentValues: {
        ...previousState.currentValues,
        [assetClass]: clampNonNegative(nextValue),
      },
    }));
  }

  function updateTargetAllocation(assetClass: AssetClassKey, nextValue: number) {
    setState((previousState) => ({
      ...previousState,
      targetAllocationPct: {
        ...previousState.targetAllocationPct,
        [assetClass]: clampNonNegative(nextValue),
      },
    }));
  }

  function resetToDefault() {
    setState(DEFAULT_MACRO_ALLOCATION_STATE);
  }

  const targetAllocationTotal = ASSET_CLASSES.reduce((sum, assetClass) => {
    return sum + state.targetAllocationPct[assetClass];
  }, 0);

  return {
    state,
    targetAllocationTotal,
    updateDepositAmount,
    updateMaxSellAmount,
    updateDepositMode,
    updateCurrentValue,
    updateTargetAllocation,
    resetToDefault,
  };
}