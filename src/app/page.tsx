import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getRoundWithResults } from "@/lib/rounds";
import { VotingCard } from "@/components/VotingCard";

export default async function HomePage() {
  const [openRound, user] = await Promise.all([
    prisma.votingRound.findFirst({ where: { status: "OPEN" } }),
    getCurrentUser(),
  ]);

  if (!openRound) {
    return (
      <div className="card mt-8 flex flex-col items-center gap-4 px-6 py-16 text-center">
        <span
          className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl"
          style={{ background: "var(--accent-soft)" }}
          aria-hidden
        >
          🗳️
        </span>
        <h1 className="text-2xl font-bold tracking-tight">
          Aktuell läuft keine Abstimmung
        </h1>
        <p className="max-w-md" style={{ color: "var(--muted)" }}>
          Schau später wieder vorbei oder wirf einen Blick auf die bisherigen
          Ergebnisse.
        </p>
        <Link href="/results" className="btn-secondary mt-2">
          Zu den Ergebnissen
        </Link>
      </div>
    );
  }

  const round = await getRoundWithResults(openRound.id, user?.id);
  if (!round) return null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3 pt-4">
        <span
          className="chip self-start"
          style={{ background: "var(--success-soft)", color: "var(--success)" }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full animate-pulse"
            style={{ background: "var(--success)" }}
            aria-hidden
          />
          Abstimmung läuft
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-balance">
          {round.title}
        </h1>
        {round.description && (
          <p className="max-w-xl text-pretty" style={{ color: "var(--muted)" }}>
            {round.description}
          </p>
        )}
      </div>
      <VotingCard round={round} isLoggedIn={!!user} />
    </div>
  );
}
