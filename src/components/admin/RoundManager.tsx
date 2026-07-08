"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Asset = { id: string; name: string; ticker: string | null };

type RoundOption = {
  id: string;
  asset: { name: string; ticker: string | null };
  votes: number;
};

type Round = {
  id: string;
  title: string;
  status: string;
  options: RoundOption[];
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Entwurf",
  OPEN: "läuft",
  CLOSED: "beendet",
};

export function RoundManager({
  assets,
  rounds,
}: {
  assets: Asset[];
  rounds: Round[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function toggleAsset(id: string) {
    setSelectedAssetIds((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/admin/rounds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, assetIds: selectedAssetIds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Fehler beim Anlegen.");
      setTitle("");
      setDescription("");
      setSelectedAssetIds([]);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler.");
    } finally {
      setSubmitting(false);
    }
  }

  async function setStatus(id: string, status: "OPEN" | "CLOSED") {
    await fetch(`/api/admin/rounds/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  }

  async function handleDeleteRound(id: string) {
    await fetch(`/api/admin/rounds/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <section className="card flex flex-col gap-5 p-5 sm:p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-bold tracking-tight">Abstimmungsrunden</h2>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Neue Runden starten als Entwurf – es kann immer nur eine gleichzeitig offen sein.
        </p>
      </div>

      <form onSubmit={handleCreate} className="flex flex-col gap-2.5">
        <input
          required
          placeholder="Titel (z. B. Wohin fließen die nächsten 500 €?)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input text-sm"
        />
        <input
          placeholder="Beschreibung (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input text-sm"
        />
        <fieldset
          className="flex flex-col gap-1.5 rounded-xl border p-3.5"
          style={{ borderColor: "var(--border)" }}
        >
          <legend className="px-1 text-xs font-medium" style={{ color: "var(--faint)" }}>
            Assets zur Auswahl (mind. 2)
          </legend>
          {assets.length === 0 && (
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              Lege zuerst unten Assets an.
            </p>
          )}
          {assets.map((asset) => (
            <label
              key={asset.id}
              className="flex cursor-pointer items-center gap-2.5 text-sm"
            >
              <input
                type="checkbox"
                checked={selectedAssetIds.includes(asset.id)}
                onChange={() => toggleAsset(asset.id)}
                className="accent-[var(--accent)]"
              />
              {asset.name}
              {asset.ticker && (
                <span className="font-mono text-xs" style={{ color: "var(--faint)" }}>
                  {asset.ticker}
                </span>
              )}
            </label>
          ))}
        </fieldset>
        {error && (
          <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
        )}
        <button
          type="submit"
          disabled={submitting || selectedAssetIds.length < 2 || !title}
          className="btn-primary self-start"
        >
          Runde anlegen
        </button>
      </form>

      <ul className="flex flex-col gap-3">
        {rounds.map((round) => {
          const totalVotes = round.options.reduce((sum, o) => sum + o.votes, 0);
          return (
            <li
              key={round.id}
              className="flex flex-col gap-3 rounded-xl border p-4"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold">{round.title}</span>
                <span className="flex items-center gap-2 text-xs" style={{ color: "var(--muted)" }}>
                  <span
                    className="chip"
                    style={
                      round.status === "OPEN"
                        ? { background: "var(--success-soft)", color: "var(--success)" }
                        : {
                            background: "var(--background)",
                            color: "var(--muted)",
                            border: "1px solid var(--border)",
                          }
                    }
                  >
                    {STATUS_LABELS[round.status] ?? round.status}
                  </span>
                  {totalVotes} {totalVotes === 1 ? "Stimme" : "Stimmen"}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {round.status !== "OPEN" && (
                  <button
                    onClick={() => setStatus(round.id, "OPEN")}
                    className="btn-primary !px-3.5 !py-1.5 !text-xs"
                  >
                    Öffnen
                  </button>
                )}
                {round.status === "OPEN" && (
                  <button
                    onClick={() => setStatus(round.id, "CLOSED")}
                    className="btn-secondary !px-3.5 !py-1.5 !text-xs"
                  >
                    Schließen
                  </button>
                )}
                <button
                  onClick={() => handleDeleteRound(round.id)}
                  className="text-xs underline underline-offset-2"
                  style={{ color: "var(--muted)" }}
                >
                  Löschen
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
