import { NextRequest, NextResponse } from "next/server";
import { isValidEmail, requestLoginCode, RateLimitError } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email : "";

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Bitte gib eine gültige E-Mail-Adresse ein." }, { status: 400 });
  }

  try {
    await requestLoginCode(email);
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    console.error("request-code failed:", error);
    return NextResponse.json(
      { error: "Der Code konnte nicht gesendet werden. Bitte versuche es später erneut." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
