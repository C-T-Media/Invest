import { NextRequest, NextResponse } from "next/server";
import { isValidEmail, verifyLoginCode } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email : "";
  const code = typeof body?.code === "string" ? body.code.trim() : "";

  if (!isValidEmail(email) || !/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: "Bitte gib E-Mail und 6-stelligen Code ein." }, { status: 400 });
  }

  try {
    const user = await verifyLoginCode(email, code);
    return NextResponse.json({ ok: true, email: user.email });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
