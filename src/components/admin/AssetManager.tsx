"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ASSET_TYPE_LABELS, assetTypeLabel } from "@/lib/assetTypes";

type Asset = {
  id: string;
  name: string;
  ticker: string | null;
  type: string;
  description: string | null;
};

export function AssetManager({ assets }: { assets: Asset[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [type, setType] = useState("ETF");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/admin/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, ticker, type, description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Fehler beim Anlegen.");
      setName("");
      setTicker("");
      setDescription("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setError("");
    const res = await fetch(`/api/admin/assets/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Löschen fehlgeschlagen.");
      return;
    }
    router.refresh();
  }

  return (
    <section className="card flex flex-col gap-5 p-5 sm:p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-bold tracking-tight">Assets</h2>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Die Anlagemöglichkeiten, aus denen Abstimmungsrunden zusammengestellt werden.
        </p>
      </div>

      <form onSubmit={handleAdd} className="flex flex-col gap-2.5">
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <input
            required
            placeholder="Name (z. B. MSCI World ETF)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input flex-1 text-sm"
          />
          <input
            placeholder="Ticker"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            className="input w-full sm:w-28 text-sm"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="input text-sm"
          >
            {Object.entries(ASSET_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <input
          placeholder="Beschreibung (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input text-sm"
        />
        {error && (
          <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
        )}
        <button type="submit" disabled={submitting} className="btn-primary self-start">
          Asset hinzufügen
        </button>
      </form>

      <ul className="flex flex-col divide-y" style={{ borderColor: "var(--border)" }}>
        {assets.map((asset) => (
          <li
            key={asset.id}
            className="flex items-center justify-between gap-3 py-3 text-sm"
            style={{ borderColor: "var(--border)" }}
          >
            <span className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{asset.name}</span>
              {asset.ticker && (
                <span className="font-mono text-xs" style={{ color: "var(--faint)" }}>
                  {asset.ticker}
                </span>
              )}
              <span
                className="chip"
                style={{
                  background: "var(--background)",
                  color: "var(--muted)",
                  border: "1px solid var(--border)",
                }}
              >
                {assetTypeLabel(asset.type)}
              </span>
            </span>
            <button
              onClick={() => handleDelete(asset.id)}
              className="shrink-0 text-xs underline underline-offset-2"
              style={{ color: "var(--muted)" }}
            >
              Löschen
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
