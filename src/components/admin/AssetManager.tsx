"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Asset = {
  id: string;
  name: string;
  ticker: string | null;
  type: string;
  description: string | null;
};

const ASSET_TYPES = ["ETF", "STOCK", "CRYPTO", "BOND", "COMMODITY", "OTHER"];

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
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Assets</h2>

      <form onSubmit={handleAdd} className="flex flex-col gap-2 max-w-md">
        <div className="flex gap-2">
          <input
            required
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 rounded-md border px-3 py-2 text-sm"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          />
          <input
            placeholder="Ticker (optional)"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            className="w-32 rounded-md border px-3 py-2 text-sm"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-md border px-3 py-2 text-sm"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            {ASSET_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <input
          placeholder="Beschreibung (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="self-start rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          style={{ background: "var(--accent)" }}
        >
          Asset hinzufügen
        </button>
      </form>

      <ul className="flex flex-col gap-2">
        {assets.map((asset) => (
          <li
            key={asset.id}
            className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
            style={{ borderColor: "var(--border)" }}
          >
            <span>
              {asset.name}
              {asset.ticker ? ` (${asset.ticker})` : ""}{" "}
              <span style={{ color: "var(--muted)" }}>· {asset.type}</span>
            </span>
            <button
              onClick={() => handleDelete(asset.id)}
              className="text-xs underline"
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
