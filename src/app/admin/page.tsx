import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/requireAdminPage";
import { AssetManager } from "@/components/admin/AssetManager";
import { RoundManager } from "@/components/admin/RoundManager";

export default async function AdminPage() {
  await requireAdminPage();

  const [assets, rounds] = await Promise.all([
    prisma.asset.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.votingRound.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        options: {
          include: { asset: true, _count: { select: { votes: true } } },
        },
      },
    }),
  ]);

  const serializedRounds = rounds.map((round) => ({
    id: round.id,
    title: round.title,
    status: round.status,
    options: round.options.map((option) => ({
      id: option.id,
      asset: { name: option.asset.name, ticker: option.asset.ticker },
      votes: option._count.votes,
    })),
  }));

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Admin</h1>
        <p style={{ color: "var(--muted)" }}>
          Assets verwalten, Runden starten und Ergebnisse auswerten.
        </p>
      </div>
      <RoundManager assets={assets} rounds={serializedRounds} />
      <AssetManager assets={assets} />
    </div>
  );
}
