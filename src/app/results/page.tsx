import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ResultsListPage() {
  const rounds = await prisma.votingRound.findMany({
    where: { status: { in: ["OPEN", "CLOSED"] } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Abstimmungen</h1>
      {rounds.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>Es gibt noch keine Abstimmungen.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rounds.map((round) => (
            <li key={round.id}>
              <Link
                href={`/results/${round.id}`}
                className="flex items-center justify-between rounded-md border px-4 py-3"
                style={{ borderColor: "var(--border)" }}
              >
                <span>{round.title}</span>
                <span
                  className="text-xs uppercase font-medium"
                  style={{ color: round.status === "OPEN" ? "var(--accent)" : "var(--muted)" }}
                >
                  {round.status === "OPEN" ? "läuft" : "beendet"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
