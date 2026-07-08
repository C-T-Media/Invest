import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getRoundWithResults } from "@/lib/rounds";
import { ResultsBars } from "@/components/ResultsBars";

export const dynamic = "force-dynamic";

export default async function ResultDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  const round = await getRoundWithResults(id, user?.id);

  // Draft rounds are only visible to admins.
  if (!round || (round.status === "DRAFT" && !user?.isAdmin)) notFound();

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div className="flex flex-col gap-2">
        <Link
          href="/results"
          className="text-sm underline underline-offset-2 self-start"
          style={{ color: "var(--muted)" }}
        >
          ← Alle Abstimmungen
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-balance">{round.title}</h1>
          {round.status === "OPEN" ? (
            <span
              className="chip"
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
              className="chip"
              style={{
                background: "var(--background)",
                color: "var(--muted)",
                border: "1px solid var(--border)",
              }}
            >
              {round.status === "DRAFT" ? "Entwurf" : "beendet"}
            </span>
          )}
        </div>
        {round.description && (
          <p className="max-w-xl text-pretty" style={{ color: "var(--muted)" }}>
            {round.description}
          </p>
        )}
      </div>
      <div className="card p-5 sm:p-6">
        <ResultsBars
          options={round.options}
          myOptionId={round.myOptionId}
          totalVotes={round.totalVotes}
        />
      </div>
    </div>
  );
}
