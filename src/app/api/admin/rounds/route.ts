import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiGuards";

export async function GET() {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const rounds = await prisma.votingRound.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      options: {
        include: { asset: true, _count: { select: { votes: true } } },
      },
    },
  });

  return NextResponse.json({ rounds });
}

export async function POST(request: NextRequest) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const description = typeof body?.description === "string" ? body.description.trim() : null;
  const assetIds: unknown = body?.assetIds;

  if (!title || !Array.isArray(assetIds) || assetIds.length < 2) {
    return NextResponse.json(
      { error: "Titel und mindestens zwei Assets sind erforderlich." },
      { status: 400 }
    );
  }

  const uniqueAssetIds = [...new Set(assetIds.filter((id) => typeof id === "string"))];

  const existing = await prisma.asset.count({ where: { id: { in: uniqueAssetIds } } });
  if (existing !== uniqueAssetIds.length) {
    return NextResponse.json(
      { error: "Mindestens ein ausgewähltes Asset existiert nicht (mehr)." },
      { status: 400 }
    );
  }

  const round = await prisma.votingRound.create({
    data: {
      title,
      description,
      status: "DRAFT",
      options: {
        create: uniqueAssetIds.map((assetId) => ({ assetId })),
      },
    },
  });

  return NextResponse.json({ round }, { status: 201 });
}
