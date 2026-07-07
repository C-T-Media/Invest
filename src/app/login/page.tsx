"use client";

import { useState } from "react";

export default function LoginPage() {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleRequestCode(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/auth/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Fehler beim Senden des Codes.");
      setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Code ungültig.");
      // Full reload so the Nav (mounted in the layout) picks up the new session.
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Anmelden</h1>

      {step === "email" ? (
        <form onSubmit={handleRequestCode} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            E-Mail-Adresse
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border px-3 py-2"
              style={{ borderColor: "var(--border)", background: "var(--surface)" }}
              placeholder="du@example.com"
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            style={{ background: "var(--accent)" }}
          >
            Code anfordern
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="flex flex-col gap-3">
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Wir haben einen 6-stelligen Code an <strong>{email}</strong> gesendet.
          </p>
          <label className="flex flex-col gap-1 text-sm">
            Code
            <input
              type="text"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="rounded-md border px-3 py-2 tracking-widest text-center text-lg"
              style={{ borderColor: "var(--border)", background: "var(--surface)" }}
              placeholder="123456"
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting || code.length !== 6}
            className="rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            style={{ background: "var(--accent)" }}
          >
            Bestätigen
          </button>
          <button
            type="button"
            onClick={() => setStep("email")}
            className="text-sm underline self-start"
            style={{ color: "var(--muted)" }}
          >
            Andere E-Mail-Adresse verwenden
          </button>
        </form>
      )}
    </div>
  );
}
