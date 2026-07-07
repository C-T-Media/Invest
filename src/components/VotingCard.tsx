"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ResultsBars } from "@/components/ResultsBars";

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
    <div className="flex flex-col gap-6">
      {isOpen && (
        <div
          className="rounded-lg border p-4 flex flex-col gap-3"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          {!isLoggedIn && (
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              <Link href="/login" className="underline font-medium" style={{ color: "var(--accent)" }}>
                Melde dich mit deiner E-Mail-Adresse an
              </Link>{" "}
              um mitzustimmen.
            </p>
          )}
          <fieldset className="flex flex-col gap-2" disabled={!isLoggedIn || submitting}>
            {round.options.map((option) => (
              <label
                key={option.id}
                className="flex items-start gap-3 rounded-md border p-3 cursor-pointer"
                style={{
                  borderColor: selected === option.id ? "var(--accent)" : "var(--border)",
                }}
              >
                <input
                  type="radio"
                  name="option"
                  value={option.id}
                  checked={selected === option.id}
                  onChange={() => setSelected(option.id)}
                  className="mt-1"
                />
                <span className="flex flex-col">
                  <span className="font-medium">
                    {option.asset.name}
                    {option.asset.ticker ? ` (${option.asset.ticker})` : ""}
                    <span
                      className="ml-2 text-xs uppercase font-normal"
                      style={{ color: "var(--muted)" }}
                    >
                      {option.asset.type}
                    </span>
                  </span>
                  {option.asset.description && (
                    <span className="text-sm" style={{ color: "var(--muted)" }}>
                      {option.asset.description}
                    </span>
                  )}
                </span>
              </label>
            ))}
          </fieldset>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {isLoggedIn && (
            <button
              onClick={handleVote}
              disabled={!selected || submitting}
              className="self-start rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              style={{ background: "var(--accent)" }}
            >
              {round.myOptionId ? "Stimme ändern" : "Abstimmen"}
            </button>
          )}
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-3">Zwischenstand</h2>
        <ResultsBars
          options={round.options}
          myOptionId={round.myOptionId}
          totalVotes={round.totalVotes}
        />
      </div>
    </div>
  );
}
