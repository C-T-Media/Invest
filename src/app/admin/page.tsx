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
    <div className="flex flex-col gap-10">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <RoundManager assets={assets} rounds={serializedRounds} />
      <AssetManager assets={assets} />
    </div>
  );
}
