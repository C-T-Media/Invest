import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/apiGuards";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if ("error" in guard) return guard.error;

  const { id } = await params;

  const usedIn = await prisma.roundOption.count({ where: { assetId: id } });
  if (usedIn > 0) {
    return NextResponse.json(
      {
        error:
          "Dieses Asset wird in Abstimmungsrunden verwendet und kann nicht gelöscht werden, ohne deren Ergebnisse zu verfälschen.",
      },
      { status: 409 }
    );
  }

  await prisma.asset.delete({ where: { id } }).catch(() => null);

  return NextResponse.json({ ok: true });
}
