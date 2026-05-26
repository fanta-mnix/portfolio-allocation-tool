export const ASSET_CLASSES = ["rendaFixa", "fiis", "acoes"] as const;

export type AssetClassKey = (typeof ASSET_CLASSES)[number];

export type DepositMode = "depositOnly" | "rebalance";

export type AssetClassValues = Record<AssetClassKey, number>;

export interface MacroAllocationFormState {
  depositAmount: number;
  currentValues: AssetClassValues;
  targetAllocationPct: AssetClassValues;
  depositMode: DepositMode;
  maxSellAmount: number;
}

export interface MacroAllocationSnapshot {
  version: number;
  state: MacroAllocationFormState;
}