import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { getRoundWithResults } from "@/lib/rounds";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  const round = await getRoundWithResults(id, user?.id);

  // Draft rounds are only visible to admins.
  if (!round || (round.status === "DRAFT" && !user?.isAdmin)) {
    return NextResponse.json({ error: "Runde nicht gefunden." }, { status: 404 });
  }

  return NextResponse.json({ round });
}
