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
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Aktuell läuft keine Abstimmung</h1>
        <p style={{ color: "var(--muted)" }}>
          Schau später wieder vorbei oder wirf einen Blick auf die{" "}
          <Link href="/results" className="underline">
            bisherigen Ergebnisse
          </Link>
          .
        </p>
      </div>
    );
  }

  const round = await getRoundWithResults(openRound.id, user?.id);
  if (!round) return null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{round.title}</h1>
        {round.description && (
          <p className="mt-2" style={{ color: "var(--muted)" }}>
            {round.description}
          </p>
        )}
      </div>
      <VotingCard round={round} isLoggedIn={!!user} />
    </div>
  );
}
