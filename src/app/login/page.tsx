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
    <div className="mx-auto mt-8 flex w-full max-w-sm flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Anmelden</h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Kein Passwort nötig – du bekommst einen Einmal-Code.
        </p>
      </div>

      <div className="card p-6">
        {step === "email" ? (
          <form onSubmit={handleRequestCode} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              E-Mail-Adresse
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input font-normal"
                placeholder="du@example.com"
              />
            </label>
            {error && (
              <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
            )}
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? "Wird gesendet …" : "Code anfordern"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="flex flex-col gap-4">
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              Wir haben einen 6-stelligen Code an{" "}
              <strong style={{ color: "var(--foreground)" }}>{email}</strong> gesendet.
            </p>
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Code
              <input
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                required
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="input text-center font-mono text-xl tracking-[0.5em]"
                placeholder="······"
              />
            </label>
            {error && (
              <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
            )}
            <button
              type="submit"
              disabled={submitting || code.length !== 6}
              className="btn-primary"
            >
              {submitting ? "Wird geprüft …" : "Bestätigen"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setCode("");
                setError("");
              }}
              className="self-center text-sm underline underline-offset-2"
              style={{ color: "var(--muted)" }}
            >
              Andere E-Mail-Adresse verwenden
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
