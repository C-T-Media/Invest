"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ASSET_TYPE_LABELS } from "@/lib/assetTypes";

export function SuggestAssetForm({ roundId }: { roundId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [type, setType] = useState("ETF");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/rounds/${roundId}/suggest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, ticker, type, description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Vorschlag fehlgeschlagen.");
      setName("");
      setTicker("");
      setDescription("");
      setSuccess("Dein Asset steht jetzt zur Abstimmung!");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn-secondary self-start !text-sm"
        >
          ＋ Eigenes Asset vorschlagen
        </button>
        {success && (
          <p className="text-sm font-medium" style={{ color: "var(--success)" }}>
            {success}
          </p>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2.5 rounded-xl border p-4"
      style={{ borderColor: "var(--border)" }}
    >
      <p className="text-sm font-semibold">Eigenes Asset vorschlagen</p>
      <p className="text-xs" style={{ color: "var(--muted)" }}>
        Dein Vorschlag erscheint sofort als Option in dieser Abstimmung (max. 3 pro Person).
      </p>
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <input
          required
          maxLength={80}
          placeholder="Name (z. B. Nvidia)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input flex-1 text-sm"
        />
        <input
          maxLength={12}
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
        maxLength={200}
        placeholder="Beschreibung (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="input text-sm"
      />
      {error && (
        <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
      )}
      <div className="flex gap-2">
        <button type="submit" disabled={submitting || !name} className="btn-primary">
          {submitting ? "Wird eingereicht …" : "Vorschlagen"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError("");
          }}
          className="btn-secondary"
        >
          Abbrechen
        </button>
      </div>
    </form>
  );
}
