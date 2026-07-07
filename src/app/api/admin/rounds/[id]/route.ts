import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiGuards";

const STATUSES = ["DRAFT", "OPEN", "CLOSED"] as const;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const status = body?.status;

  if (!STATUSES.includes(status)) {
    return NextResponse.json({ error: "Ungültiger Status." }, { status: 400 });
  }

  if (status === "OPEN") {
    // Only one round can be open for voting at a time.
    await prisma.votingRound.updateMany({
      where: { status: "OPEN", NOT: { id } },
      data: { status: "CLOSED", endsAt: new Date() },
    });
  }

  try {
    const round = await prisma.votingRound.update({
      where: { id },
      data: {
        status,
        startsAt: status === "OPEN" ? new Date() : undefined,
        endsAt: status === "CLOSED" ? new Date() : undefined,
      },
    });
    return NextResponse.json({ round });
  } catch {
    return NextResponse.json({ error: "Runde nicht gefunden." }, { status: 404 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const { id } = await params;
  await prisma.votingRound.delete({ where: { id } }).catch(() => null);

  return NextResponse.json({ ok: true });
}
