"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ResultsBars } from "@/components/ResultsBars";
import { SuggestAssetForm } from "@/components/SuggestAssetForm";
import { assetTypeLabel } from "@/lib/assetTypes";

type OptionResult = {
  id: string;
  votes: number;
  percentage: number;
  asset: {
    name: string;
    ticker: string | null;
    type: string;
    description: string | null;
  };
};

type Round = {
  id: string;
  status: string;
  totalVotes: number;
  myOptionId: string | null;
  options: OptionResult[];
};

export function VotingCard({
  round,
  isLoggedIn,
}: {
  round: Round;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState(round.myOptionId ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Re-sync the selection when the server sends fresh round data (e.g. after
  // router.refresh() or a session change) so SSR and client never diverge.
  const [prevMyOptionId, setPrevMyOptionId] = useState(round.myOptionId);
  if (prevMyOptionId !== round.myOptionId) {
    setPrevMyOptionId(round.myOptionId);
    setSelected(round.myOptionId ?? "");
  }

  async function handleVote() {
    if (!selected) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/rounds/${round.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId: selected }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Abstimmung fehlgeschlagen.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler.");
    } finally {
      setSubmitting(false);
    }
  }

  const isOpen = round.status === "OPEN";

  return (
    <div className="flex flex-col gap-8">
      {isOpen && (
        <section className="card flex flex-col gap-4 p-5 sm:p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--faint)" }}>
            Deine Stimme
          </h2>
          {!isLoggedIn && (
            <div
              className="flex flex-col items-start gap-3 rounded-xl p-4 sm:flex-row sm:items-center sm:justify-between"
              style={{ background: "var(--accent-soft)" }}
            >
              <p className="text-sm">
                Melde dich mit deiner E-Mail-Adresse an, um mitzustimmen.
              </p>
              <Link href="/login" className="btn-primary !py-2 shrink-0">
                Jetzt anmelden
              </Link>
            </div>
          )}
          <fieldset
            className="flex flex-col gap-2.5"
            disabled={!isLoggedIn || submitting}
          >
            {round.options.map((option) => {
              const isSelected = selected === option.id;
              return (
                <label
                  key={option.id}
                  className={`flex cursor-pointer items-start gap-3.5 rounded-xl border p-4 transition-all ${
                    isLoggedIn ? "hover:border-[var(--accent)]" : "cursor-default opacity-80"
                  }`}
                  style={{
                    borderColor: isSelected ? "var(--accent)" : "var(--border)",
                    background: isSelected ? "var(--accent-soft)" : "transparent",
                    boxShadow: isSelected
                      ? "0 0 0 1px var(--accent)"
                      : "none",
                  }}
                >
                  <input
                    type="radio"
                    name="option"
                    value={option.id}
                    checked={isSelected}
                    onChange={() => setSelected(option.id)}
                    className="mt-1.5 accent-[var(--accent)]"
                  />
                  <span className="flex flex-1 flex-col gap-0.5">
                    <span className="flex flex-wrap items-center gap-2 font-semibold">
                      {option.asset.name}
                      {option.asset.ticker && (
                        <span
                          className="font-mono text-xs font-medium"
                          style={{ color: "var(--faint)" }}
                        >
                          {option.asset.ticker}
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
                        {assetTypeLabel(option.asset.type)}
                      </span>
                    </span>
                    {option.asset.description && (
                      <span className="text-sm" style={{ color: "var(--muted)" }}>
                        {option.asset.description}
                      </span>
                    )}
                  </span>
                </label>
              );
            })}
          </fieldset>
          {error && (
            <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
          )}
          {isLoggedIn && (
            <button
              onClick={handleVote}
              disabled={!selected || submitting}
              className="btn-primary self-start"
            >
              {submitting
                ? "Wird gespeichert …"
                : round.myOptionId
                  ? "Stimme ändern"
                  : "Abstimmen"}
            </button>
          )}
          {isLoggedIn && (
            <div className="border-t pt-4" style={{ borderColor: "var(--border)" }}>
              <SuggestAssetForm roundId={round.id} />
            </div>
          )}
        </section>
      )}

      <section className="card flex flex-col gap-4 p-5 sm:p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--faint)" }}>
          Zwischenstand
        </h2>
        <ResultsBars
          options={round.options}
          myOptionId={round.myOptionId}
          totalVotes={round.totalVotes}
        />
      </section>
    </div>
  );
}
