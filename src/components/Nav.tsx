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
      className="sticky top-0 z-10 w-full border-b backdrop-blur-md"
      style={{
        borderColor: "var(--border)",
        background: "color-mix(in srgb, var(--background) 85%, transparent)",
      }}
    >
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white text-sm font-bold"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-strong))" }}
            aria-hidden
          >
            IV
          </span>
          <span className="hidden sm:inline">Invest Voting</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/results"
            className="rounded-lg px-3 py-1.5 font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          >
            Ergebnisse
          </Link>
          {user?.isAdmin && (
            <Link
              href="/admin"
              className="rounded-lg px-3 py-1.5 font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/10"
            >
              Admin
            </Link>
          )}
          {user === undefined ? null : user ? (
            <span className="flex items-center gap-2 pl-2">
              <span
                className="hidden sm:inline max-w-40 truncate rounded-full border px-3 py-1 text-xs"
                style={{ borderColor: "var(--border)", color: "var(--muted)" }}
                title={user.email}
              >
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="rounded-lg px-3 py-1.5 font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                style={{ color: "var(--muted)" }}
              >
                Abmelden
              </button>
            </span>
          ) : (
            <Link href="/login" className="btn-primary ml-2 !py-1.5 !px-4">
              Anmelden
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
