"use client";

import { useMemo, useState } from "react";

import { useMacroAllocationState } from "@/app/_hooks/use-macro-allocation-state";
import { calculateMacroAllocation } from "@/lib/macro-allocation/calculate";
import { ASSET_CLASS_LABELS } from "@/lib/macro-allocation/defaults";
import {
  formatCurrencyBR,
  formatDecimalBR,
  formatPercentBR,
  parsePtBrNumber,
} from "@/lib/macro-allocation/format";
import { ASSET_CLASSES } from "@/lib/macro-allocation/types";

interface LocalizedNumberInputProps {
  value: number;
  onValueChange: (value: number) => void;
  formatValue: (value: number) => string;
  disabled?: boolean;
}

function LocalizedNumberInput({
  value,
  onValueChange,
  formatValue,
  disabled,
}: LocalizedNumberInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [draftValue, setDraftValue] = useState("");

  const displayedValue = isFocused ? draftValue : formatValue(value);

  return (
    <input
      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-slate-500"
      type="text"
      inputMode="decimal"
      value={displayedValue}
      disabled={disabled}
      onFocus={() => {
        setIsFocused(true);
        setDraftValue(formatValue(value));
      }}
      onChange={(event) => {
        const nextDraft = event.target.value;
        setDraftValue(nextDraft);

        const parsedValue = parsePtBrNumber(nextDraft);
        if (parsedValue !== null) {
          onValueChange(parsedValue);
        }
      }}
      onBlur={() => {
        setIsFocused(false);
        setDraftValue("");
      }}
    />
  );
}

export function MacroAllocationShell() {
  const {
    state,
    targetAllocationTotal,
    updateDepositAmount,
    updateMaxSellAmount,
    updateDepositMode,
    updateCurrentValue,
    updateTargetAllocation,
    resetToDefault,
  } = useMacroAllocationState();

  const targetAllocationStatus = useMemo(() => {
    if (targetAllocationTotal === 100) {
      return "Meta total: 100%";
    }

    return `Meta total: ${targetAllocationTotal.toFixed(2)}%`;
  }, [targetAllocationTotal]);

  const allocationResult = useMemo(() => {
    return calculateMacroAllocation(state);
  }, [state]);

  const currentTotal = useMemo(() => {
    return ASSET_CLASSES.reduce((sum, assetClass) => {
      return sum + state.currentValues[assetClass];
    }, 0);
  }, [state.currentValues]);

  const targetDifference = useMemo(() => {
    return Math.abs(targetAllocationTotal - 100);
  }, [targetAllocationTotal]);

  const isDepositValid = state.depositAmount > 0;
  const isTargetTotalValid = targetDifference < 0.01;
  const isCurrentValuesValid = ASSET_CLASSES.every((assetClass) => {
    return state.currentValues[assetClass] >= 0;
  });
  const isSellLimitValid = state.maxSellAmount >= 0;

  return (
    <main className="desktop-shell min-h-full w-full px-10 py-12">
      <section className="mx-auto w-full max-w-6xl rounded-2xl border border-slate-200 bg-white/90 p-10 shadow-[0_10px_40px_rgba(2,6,23,0.08)]">
        <header className="mb-10 border-b border-slate-200 pb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">
            Etapa 5
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Alocação de Portfólio
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
            Formatação e parsing de entradas no padrão pt-BR com vírgula decimal.
          </p>
        </header>

        <div className="grid grid-cols-2 gap-6">
          <article className="space-y-5 rounded-xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-lg font-semibold text-slate-800">Entradas gerais</h2>

            <label className="block text-sm font-medium text-slate-700">
              Valor do aporte (R$)
              <LocalizedNumberInput
                value={state.depositAmount}
                formatValue={formatDecimalBR}
                onValueChange={updateDepositAmount}
              />
            </label>
            <p
              className={`text-xs font-medium ${
                isDepositValid ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {isDepositValid
                ? "Aporte válido."
                : "Informe um aporte maior que R$ 0,00."}
            </p>

            <label className="block text-sm font-medium text-slate-700">
              Modo de aporte
              <select
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-slate-500"
                value={state.depositMode}
                onChange={(event) => {
                  if (event.target.value === "rebalance") {
                    updateDepositMode("rebalance");
                    return;
                  }

                  updateDepositMode("depositOnly");
                }}
              >
                <option value="depositOnly">Somente aporte (sem vendas)</option>
                <option value="rebalance">Rebalancear (permite vendas)</option>
              </select>
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Máximo permitido de vendas (R$)
              <LocalizedNumberInput
                value={state.maxSellAmount}
                formatValue={formatDecimalBR}
                onValueChange={updateMaxSellAmount}
                disabled={state.depositMode === "depositOnly"}
              />
            </label>
            <p
              className={`text-xs font-medium ${
                isSellLimitValid ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {state.depositMode === "depositOnly"
                ? "Modo somente aporte: vendas desabilitadas."
                : isSellLimitValid
                  ? "Limite de vendas válido."
                  : "O limite de vendas não pode ser negativo."}
            </p>
          </article>

          <article className="space-y-5 rounded-xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-lg font-semibold text-slate-800">
              Valores atuais por classe
            </h2>

            {ASSET_CLASSES.map((assetClass) => {
              return (
                <label
                  key={`current-${assetClass}`}
                  className="block text-sm font-medium text-slate-700"
                >
                  {ASSET_CLASS_LABELS[assetClass]} (R$)
                  <LocalizedNumberInput
                    value={state.currentValues[assetClass]}
                    formatValue={formatDecimalBR}
                    onValueChange={(value) => {
                      updateCurrentValue(assetClass, value);
                    }}
                  />
                </label>
              );
            })}

            <p
              className={`text-xs font-medium ${
                isCurrentValuesValid ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {isCurrentValuesValid
                ? `Total atual da carteira: ${formatCurrencyBR(currentTotal)}.`
                : "Os valores atuais precisam ser maiores ou iguais a zero."}
            </p>
          </article>

          <article className="space-y-5 rounded-xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-lg font-semibold text-slate-800">Meta de alocação (%)</h2>

            {ASSET_CLASSES.map((assetClass) => {
              return (
                <label
                  key={`target-${assetClass}`}
                  className="block text-sm font-medium text-slate-700"
                >
                  {ASSET_CLASS_LABELS[assetClass]}
                  <LocalizedNumberInput
                    value={state.targetAllocationPct[assetClass]}
                    formatValue={formatDecimalBR}
                    onValueChange={(value) => {
                      updateTargetAllocation(assetClass, value);
                    }}
                  />
                </label>
              );
            })}

            <p className="text-sm font-semibold text-slate-700">{targetAllocationStatus}</p>
            <p
              className={`text-xs font-medium ${
                isTargetTotalValid ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {isTargetTotalValid
                ? "Metas válidas: soma de 100%."
                : `A soma da meta deve ser 100% (diferença atual: ${formatPercentBR(
                    targetDifference,
                  )}).`}
            </p>
          </article>

          <article className="rounded-xl border border-slate-200 bg-slate-50 p-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Resultado macro (prévia)</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Dados carregados e salvos automaticamente no navegador.
              </p>

              <div className="mt-4 space-y-2 text-sm text-slate-700">
                <p>
                  Compras totais: <strong>{formatCurrencyBR(allocationResult.totalBuyAmount)}</strong>
                </p>
                <p>
                  Vendas totais: <strong>{formatCurrencyBR(allocationResult.totalSellAmount)}</strong>
                </p>
                <p>
                  Status:{" "}
                  <strong>
                    {allocationResult.reachedTarget && isTargetTotalValid
                      ? "Meta atingida"
                      : allocationResult.isSellConstrained
                        ? "Melhor aproximação com teto de venda"
                        : isTargetTotalValid
                          ? "Melhor aproximação"
                          : "Ajuste as metas para somar 100%"}
                  </strong>
                </p>
              </div>

              <div className="mt-5 space-y-2 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
                {ASSET_CLASSES.map((assetClass) => {
                  const movement = allocationResult.netMovements[assetClass];
                  const actionLabel =
                    movement < 0
                      ? "Vender"
                      : movement > 0
                        ? "Aportar"
                        : "Sem movimentação";

                  return (
                    <p key={`movement-${assetClass}`} className="flex justify-between gap-3">
                      <span>{ASSET_CLASS_LABELS[assetClass]}</span>
                      <span className="font-semibold">
                        {actionLabel}: {formatCurrencyBR(Math.abs(movement))}
                      </span>
                    </p>
                  );
                })}
              </div>

              <div className="mt-5 space-y-2 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
                <p className="font-semibold text-slate-800">Resumo antes/depois</p>
                {ASSET_CLASSES.map((assetClass) => {
                  const beforeValue = state.currentValues[assetClass];
                  const afterValue = allocationResult.finalValues[assetClass];

                  return (
                    <p key={`summary-${assetClass}`} className="flex justify-between gap-3">
                      <span>{ASSET_CLASS_LABELS[assetClass]}</span>
                      <span>
                        {formatCurrencyBR(beforeValue)} → {formatCurrencyBR(afterValue)}
                      </span>
                    </p>
                  );
                })}
              </div>
            </div>

            <button
              className="mt-6 w-fit rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
              type="button"
              onClick={resetToDefault}
            >
              Restaurar valores padrão
            </button>
          </article>
        </div>
      </section>
    </main>
  );
}
