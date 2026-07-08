export const ASSET_TYPE_LABELS: Record<string, string> = {
  ETF: "ETF",
  STOCK: "Aktie",
  CRYPTO: "Krypto",
  BOND: "Anleihe",
  COMMODITY: "Rohstoff",
  OTHER: "Sonstiges",
};

export function assetTypeLabel(type: string): string {
  return ASSET_TYPE_LABELS[type] ?? type;
}
