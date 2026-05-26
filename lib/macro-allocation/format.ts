const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const decimalFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrencyBR(value: number): string {
  return currencyFormatter.format(value);
}

export function formatDecimalBR(value: number): string {
  return decimalFormatter.format(value);
}

export function formatPercentBR(value: number): string {
  return `${percentFormatter.format(value)}%`;
}

export function parsePtBrNumber(inputValue: string): number | null {
  const sanitized = inputValue
    .trim()
    .replace(/\s/g, "")
    .replace("R$", "")
    .replace("%", "")
    .replace(/\./g, "")
    .replace(",", ".");

  if (!sanitized) {
    return 0;
  }

  const parsed = Number.parseFloat(sanitized);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  return parsed;
}