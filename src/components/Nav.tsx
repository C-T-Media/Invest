"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Me {
  id: string;
  email: string;
  isAdmin: boolean;
}

export function Nav() {
  const [user, setUser] = useState<Me | null | undefined>(undefined);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <header
      className="w-full border-b"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold">
          Community Invest Voting
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/results">Ergebnisse</Link>
          {user?.isAdmin && <Link href="/admin">Admin</Link>}
          {user === undefined ? null : user ? (
            <span className="flex items-center gap-3">
              <span style={{ color: "var(--muted)" }}>{user.email}</span>
              <button
                onClick={handleLogout}
                className="underline"
                style={{ color: "var(--muted)" }}
              >
                Abmelden
              </button>
            </span>
          ) : (
            <Link href="/login" className="font-medium" style={{ color: "var(--accent)" }}>
              Anmelden
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
