import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

export async function requireAdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.isAdmin) redirect("/");
  return user;
}
