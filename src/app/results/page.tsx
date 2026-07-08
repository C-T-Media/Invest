import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ResultsListPage() {
  const rounds = await prisma.votingRound.findMany({
    where: { status: { in: ["OPEN", "CLOSED"] } },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { votes: true } } },
  });

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Abstimmungen</h1>
        <p style={{ color: "var(--muted)" }}>
          Alle laufenden und abgeschlossenen Abstimmungsrunden.
        </p>
      </div>
      {rounds.length === 0 ? (
        <div className="card px-6 py-12 text-center" style={{ color: "var(--muted)" }}>
          Es gibt noch keine Abstimmungen.
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {rounds.map((round) => (
            <li key={round.id}>
              <Link
                href={`/results/${round.id}`}
                className="card flex items-center justify-between gap-4 px-5 py-4 transition-transform hover:-translate-y-0.5"
              >
                <span className="flex flex-col gap-0.5">
                  <span className="font-semibold">{round.title}</span>
                  <span className="text-xs" style={{ color: "var(--faint)" }}>
                    {round._count.votes}{" "}
                    {round._count.votes === 1 ? "Stimme" : "Stimmen"} ·{" "}
                    {round.createdAt.toLocaleDateString("de-DE")}
                  </span>
                </span>
                {round.status === "OPEN" ? (
                  <span
                    className="chip shrink-0"
                    style={{ background: "var(--success-soft)", color: "var(--success)" }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full animate-pulse"
                      style={{ background: "var(--success)" }}
                      aria-hidden
                    />
                    läuft
                  </span>
                ) : (
                  <span
                    className="chip shrink-0"
                    style={{
                      background: "var(--background)",
                      color: "var(--muted)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    beendet
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
