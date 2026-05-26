import { ASSET_CLASSES, type AssetClassValues, type MacroAllocationFormState } from "./types";

const CENT_EPSILON = 0.005;

export interface MacroAllocationResult {
  normalizedTargetWeights: AssetClassValues;
  targetValues: AssetClassValues;
  netMovements: AssetClassValues;
  finalValues: AssetClassValues;
  buyAmounts: AssetClassValues;
  sellAmounts: AssetClassValues;
  targetGaps: AssetClassValues;
  totalBuyAmount: number;
  totalSellAmount: number;
  targetTotalInput: number;
  reachedTarget: boolean;
  isSellConstrained: boolean;
}

function clampNonNegative(value: number): number {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }

  return value;
}

function zeroAssetValues(): AssetClassValues {
  return {
    rendaFixa: 0,
    fiis: 0,
    acoes: 0,
  };
}

function sumAssetValues(values: AssetClassValues): number {
  return ASSET_CLASSES.reduce((sum, assetClass) => {
    return sum + values[assetClass];
  }, 0);
}

function normalizeTargetWeights(targetAllocationPct: AssetClassValues): {
  normalizedTargetWeights: AssetClassValues;
  targetTotalInput: number;
} {
  const safeTargetValues: AssetClassValues = {
    rendaFixa: clampNonNegative(targetAllocationPct.rendaFixa),
    fiis: clampNonNegative(targetAllocationPct.fiis),
    acoes: clampNonNegative(targetAllocationPct.acoes),
  };

  const targetTotalInput = sumAssetValues(safeTargetValues);

  if (targetTotalInput <= 0) {
    return {
      targetTotalInput,
      normalizedTargetWeights: {
        rendaFixa: 1 / 3,
        fiis: 1 / 3,
        acoes: 1 / 3,
      },
    };
  }

  return {
    targetTotalInput,
    normalizedTargetWeights: {
      rendaFixa: safeTargetValues.rendaFixa / targetTotalInput,
      fiis: safeTargetValues.fiis / targetTotalInput,
      acoes: safeTargetValues.acoes / targetTotalInput,
    },
  };
}

export function calculateMacroAllocation(state: MacroAllocationFormState): MacroAllocationResult {
  const depositAmount = clampNonNegative(state.depositAmount);
  const maxSellAmount =
    state.depositMode === "rebalance" ? clampNonNegative(state.maxSellAmount) : 0;

  const currentValues: AssetClassValues = {
    rendaFixa: clampNonNegative(state.currentValues.rendaFixa),
    fiis: clampNonNegative(state.currentValues.fiis),
    acoes: clampNonNegative(state.currentValues.acoes),
  };

  const { normalizedTargetWeights, targetTotalInput } = normalizeTargetWeights(
    state.targetAllocationPct,
  );

  const currentTotal = sumAssetValues(currentValues);
  const finalTotal = currentTotal + depositAmount;

  const targetValues: AssetClassValues = {
    rendaFixa: finalTotal * normalizedTargetWeights.rendaFixa,
    fiis: finalTotal * normalizedTargetWeights.fiis,
    acoes: finalTotal * normalizedTargetWeights.acoes,
  };

  const desiredNetMovements: AssetClassValues = {
    rendaFixa: targetValues.rendaFixa - currentValues.rendaFixa,
    fiis: targetValues.fiis - currentValues.fiis,
    acoes: targetValues.acoes - currentValues.acoes,
  };

  const desiredSellAmounts = zeroAssetValues();
  const desiredBuyAmounts = zeroAssetValues();

  for (const assetClass of ASSET_CLASSES) {
    const desiredMovement = desiredNetMovements[assetClass];

    if (desiredMovement < 0) {
      desiredSellAmounts[assetClass] = -desiredMovement;
      continue;
    }

    desiredBuyAmounts[assetClass] = desiredMovement;
  }

  const desiredSellTotal = sumAssetValues(desiredSellAmounts);
  const desiredBuyTotal = sumAssetValues(desiredBuyAmounts);

  const allowedSellTotal = Math.min(desiredSellTotal, maxSellAmount);
  const sellScale = desiredSellTotal <= CENT_EPSILON ? 0 : allowedSellTotal / desiredSellTotal;

  const sellAmounts = zeroAssetValues();

  for (const assetClass of ASSET_CLASSES) {
    sellAmounts[assetClass] = desiredSellAmounts[assetClass] * sellScale;
  }

  const requiredBuyTotal = depositAmount + allowedSellTotal;
  const buyAmounts = zeroAssetValues();

  if (desiredBuyTotal <= CENT_EPSILON) {
    for (const assetClass of ASSET_CLASSES) {
      buyAmounts[assetClass] = requiredBuyTotal * normalizedTargetWeights[assetClass];
    }
  } else {
    const buyScale = requiredBuyTotal / desiredBuyTotal;

    for (const assetClass of ASSET_CLASSES) {
      buyAmounts[assetClass] = desiredBuyAmounts[assetClass] * buyScale;
    }
  }

  const netMovements = zeroAssetValues();

  for (const assetClass of ASSET_CLASSES) {
    netMovements[assetClass] = buyAmounts[assetClass] - sellAmounts[assetClass];
  }

  const netTotal = sumAssetValues(netMovements);
  const balancingDelta = depositAmount - netTotal;

  if (Math.abs(balancingDelta) > CENT_EPSILON) {
    const balancingAssetClass = ASSET_CLASSES.reduce((best, candidate) => {
      if (normalizedTargetWeights[candidate] > normalizedTargetWeights[best]) {
        return candidate;
      }

      return best;
    }, ASSET_CLASSES[0]);

    netMovements[balancingAssetClass] += balancingDelta;
  }

  const finalValues = zeroAssetValues();
  const targetGaps = zeroAssetValues();

  for (const assetClass of ASSET_CLASSES) {
    finalValues[assetClass] = Math.max(0, currentValues[assetClass] + netMovements[assetClass]);
    targetGaps[assetClass] = finalValues[assetClass] - targetValues[assetClass];
  }

  const totalSellAmount = ASSET_CLASSES.reduce((sum, assetClass) => {
    const movement = netMovements[assetClass];

    return sum + (movement < 0 ? -movement : 0);
  }, 0);

  const totalBuyAmount = ASSET_CLASSES.reduce((sum, assetClass) => {
    const movement = netMovements[assetClass];

    return sum + (movement > 0 ? movement : 0);
  }, 0);

  const maxAbsGap = ASSET_CLASSES.reduce((max, assetClass) => {
    return Math.max(max, Math.abs(targetGaps[assetClass]));
  }, 0);

  const isSellConstrained = desiredSellTotal - allowedSellTotal > CENT_EPSILON;

  return {
    normalizedTargetWeights,
    targetValues,
    netMovements,
    finalValues,
    buyAmounts,
    sellAmounts,
    targetGaps,
    totalBuyAmount,
    totalSellAmount,
    targetTotalInput,
    reachedTarget: !isSellConstrained && maxAbsGap <= CENT_EPSILON,
    isSellConstrained,
  };
}