import { NextResponse } from "next/server";
import { getCurrentUser, type CurrentUser } from "@/lib/session";

export async function requireUser(): Promise<
  { user: CurrentUser } | { error: NextResponse }
> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 }) };
  }
  return { user };
}

export async function requireAdmin(): Promise<
  { user: CurrentUser } | { error: NextResponse }
> {
  const result = await requireUser();
  if ("error" in result) return result;
  if (!result.user.isAdmin) {
    return { error: NextResponse.json({ error: "Kein Zugriff." }, { status: 403 }) };
  }
  return result;
}
