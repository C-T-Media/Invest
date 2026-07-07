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
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Abstimmungsrunden</h2>

      <form onSubmit={handleCreate} className="flex flex-col gap-2 max-w-md">
        <input
          required
          placeholder="Titel"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        />
        <input
          placeholder="Beschreibung (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        />
        <fieldset className="flex flex-col gap-1 rounded-md border p-3" style={{ borderColor: "var(--border)" }}>
          <legend className="text-xs px-1" style={{ color: "var(--muted)" }}>
            Assets zur Auswahl (mind. 2)
          </legend>
          {assets.map((asset) => (
            <label key={asset.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedAssetIds.includes(asset.id)}
                onChange={() => toggleAsset(asset.id)}
              />
              {asset.name}
              {asset.ticker ? ` (${asset.ticker})` : ""}
            </label>
          ))}
        </fieldset>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting || selectedAssetIds.length < 2 || !title}
          className="self-start rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          style={{ background: "var(--accent)" }}
        >
          Runde anlegen (als Entwurf)
        </button>
      </form>

      <ul className="flex flex-col gap-3">
        {rounds.map((round) => {
          const totalVotes = round.options.reduce((sum, o) => sum + o.votes, 0);
          return (
            <li
              key={round.id}
              className="rounded-md border p-3 flex flex-col gap-2"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{round.title}</span>
                <span className="text-xs uppercase" style={{ color: "var(--muted)" }}>
                  {round.status} · {totalVotes} Stimmen
                </span>
              </div>
              <div className="flex gap-2 text-xs">
                {round.status !== "OPEN" && (
                  <button
                    onClick={() => setStatus(round.id, "OPEN")}
                    className="rounded px-2 py-1 text-white"
                    style={{ background: "var(--accent)" }}
                  >
                    Öffnen
                  </button>
                )}
                {round.status === "OPEN" && (
                  <button
                    onClick={() => setStatus(round.id, "CLOSED")}
                    className="rounded border px-2 py-1"
                    style={{ borderColor: "var(--border)" }}
                  >
                    Schließen
                  </button>
                )}
                <button
                  onClick={() => handleDeleteRound(round.id)}
                  className="underline"
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
