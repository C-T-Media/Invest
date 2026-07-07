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

  if (!round) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{round.title}</h1>
        {round.description && (
          <p className="mt-2" style={{ color: "var(--muted)" }}>
            {round.description}
          </p>
        )}
        <p className="text-xs mt-1 uppercase font-medium" style={{ color: "var(--muted)" }}>
          {round.status === "OPEN" ? "läuft noch" : "beendet"}
        </p>
      </div>
      <ResultsBars
        options={round.options}
        myOptionId={round.myOptionId}
        totalVotes={round.totalVotes}
      />
    </div>
  );
}
