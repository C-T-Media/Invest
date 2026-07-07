import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/apiGuards";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: roundId } = await params;
  const guard = await requireUser();
  if ("error" in guard) return guard.error;

  const body = await request.json().catch(() => null);
  const optionId = typeof body?.optionId === "string" ? body.optionId : null;
  if (!optionId) {
    return NextResponse.json({ error: "Bitte wähle eine Option aus." }, { status: 400 });
  }

  const round = await prisma.votingRound.findUnique({ where: { id: roundId } });
  if (!round || round.status !== "OPEN") {
    return NextResponse.json({ error: "Diese Abstimmung ist nicht (mehr) offen." }, { status: 400 });
  }

  const option = await prisma.roundOption.findUnique({ where: { id: optionId } });
  if (!option || option.roundId !== roundId) {
    return NextResponse.json({ error: "Ungültige Option." }, { status: 400 });
  }

  await prisma.vote.upsert({
    where: { roundId_userId: { roundId, userId: guard.user.id } },
    update: { optionId },
    create: { roundId, userId: guard.user.id, optionId },
  });

  return NextResponse.json({ ok: true });
}
