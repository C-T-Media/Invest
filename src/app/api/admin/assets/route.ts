import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiGuards";

const ASSET_TYPES = ["ETF", "STOCK", "CRYPTO", "BOND", "COMMODITY", "OTHER"] as const;

export async function GET() {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const assets = await prisma.asset.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ assets });
}

export async function POST(request: NextRequest) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const ticker = typeof body?.ticker === "string" ? body.ticker.trim() : null;
  const type = body?.type;
  const description = typeof body?.description === "string" ? body.description.trim() : null;

  if (!name || !ASSET_TYPES.includes(type)) {
    return NextResponse.json({ error: "Name und ein gültiger Typ sind erforderlich." }, { status: 400 });
  }

  const asset = await prisma.asset.create({
    data: { name, ticker, type, description },
  });

  return NextResponse.json({ asset }, { status: 201 });
}
