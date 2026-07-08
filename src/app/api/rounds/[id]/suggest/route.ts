import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/apiGuards";

const ASSET_TYPES = ["ETF", "STOCK", "CRYPTO", "BOND", "COMMODITY", "OTHER"] as const;
const MAX_SUGGESTIONS_PER_ROUND = 3;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: roundId } = await params;
  const guard = await requireUser();
  if ("error" in guard) return guard.error;

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const ticker =
    typeof body?.ticker === "string" && body.ticker.trim()
      ? body.ticker.trim().toUpperCase()
      : null;
  const type = body?.type;
  const description =
    typeof body?.description === "string" && body.description.trim()
      ? body.description.trim()
      : null;

  if (!name || !ASSET_TYPES.includes(type)) {
    return NextResponse.json(
      { error: "Name und ein gültiger Typ sind erforderlich." },
      { status: 400 }
    );
  }
  if (name.length > 80 || (ticker?.length ?? 0) > 12 || (description?.length ?? 0) > 200) {
    return NextResponse.json(
      { error: "Name (max. 80), Ticker (max. 12) oder Beschreibung (max. 200 Zeichen) ist zu lang." },
      { status: 400 }
    );
  }

  const round = await prisma.votingRound.findUnique({ where: { id: roundId } });
  if (!round || round.status !== "OPEN") {
    return NextResponse.json(
      { error: "Vorschläge sind nur möglich, solange die Abstimmung offen ist." },
      { status: 400 }
    );
  }

  const options = await prisma.roundOption.findMany({
    where: { roundId },
    include: { asset: { select: { name: true, ticker: true, createdById: true } } },
  });

  const normalizedName = name.toLowerCase();
  const duplicate = options.find(
    (option) =>
      option.asset.name.trim().toLowerCase() === normalizedName ||
      (ticker !== null && option.asset.ticker?.toUpperCase() === ticker)
  );
  if (duplicate) {
    return NextResponse.json(
      { error: "Dieses Asset steht bereits zur Auswahl." },
      { status: 409 }
    );
  }

  const ownSuggestions = options.filter(
    (option) => option.asset.createdById === guard.user.id
  ).length;
  if (ownSuggestions >= MAX_SUGGESTIONS_PER_ROUND) {
    return NextResponse.json(
      { error: `Du kannst pro Runde höchstens ${MAX_SUGGESTIONS_PER_ROUND} Assets vorschlagen.` },
      { status: 429 }
    );
  }

  const asset = await prisma.asset.create({
    data: {
      name,
      ticker,
      type,
      description,
      createdById: guard.user.id,
      roundOptions: { create: { roundId } },
    },
  });

  return NextResponse.json({ asset }, { status: 201 });
}
