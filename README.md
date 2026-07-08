# Community Invest Voting

Eine Webseite, mit der eine Community per E-Mail-Anmeldung darüber abstimmen kann,
in welche Assets (ETF, Aktien, Krypto, ...) als Nächstes investiert werden soll.
Ein Admin-Bereich zeigt die ausgewertete Abstimmung im Backend an.

## Tech-Stack

- **Next.js (App Router, TypeScript)** – Frontend & API-Routes in einer Codebasis
- **Prisma + PostgreSQL** – funktioniert mit jeder Postgres-Instanz (Neon, Supabase, lokal, …)
- **E-Mail + Bestätigungscode** – Login ohne Passwort, 6-stelliger Code per Mail (10 Min. gültig)
- **Nodemailer** – Mailversand; ohne SMTP-Konfiguration wird der Code stattdessen in die Server-Konsole geloggt (praktisch für lokale Entwicklung)

## Setup

```bash
npm install
cp .env.example .env   # anpassen: DATABASE_URL, ADMIN_EMAILS, SESSION_SECRET, ggf. SMTP_*
npx prisma migrate dev
npm run db:seed        # legt Beispiel-Assets + eine offene Demo-Abstimmung an
npm run dev
```

Die Seite läuft danach unter http://localhost:3000.

### Umgebungsvariablen (`.env`)

| Variable | Bedeutung |
|---|---|
| `DATABASE_URL` | Postgres-Connection-String, z. B. von Neon oder Supabase |
| `ADMIN_EMAILS` | Kommagetrennte Liste von E-Mail-Adressen mit Admin-Zugriff auf `/admin` |
| `SESSION_SECRET` | Geheimer Schlüssel zum Signieren der Session-Cookies – **in Produktion unbedingt ändern** |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASSWORD` / `SMTP_FROM` | SMTP-Zugangsdaten für den Mailversand. Ohne `SMTP_HOST` wird der Login-Code nur in die Konsole geloggt. |

## Funktionsweise

- **Anmeldung**: Nutzer geben ihre E-Mail-Adresse ein und erhalten einen 6-stelligen
  Code (10 Minuten gültig, max. 5 Versuche, 1 Anfrage pro Minute). Nach Eingabe des
  Codes wird ein Nutzerkonto angelegt (falls noch nicht vorhanden) und eine
  Session gestartet.
- **Abstimmen**: Auf der Startseite wird die aktuell offene Abstimmungsrunde mit
  ihren Asset-Optionen angezeigt. Angemeldete Nutzer können pro Runde eine Stimme
  abgeben und sie beliebig ändern, solange die Runde offen ist (ein Vote pro
  Nutzer und Runde). Der Zwischenstand ist für alle sichtbar.
- **Assets vorschlagen**: Angemeldete Nutzer können während einer offenen Runde
  eigene Assets vorschlagen (max. 3 pro Person und Runde). Der Vorschlag erscheint
  sofort als wählbare Option; Duplikate (gleicher Name oder Ticker) werden
  abgelehnt. Gelöscht werden können Assets nur von Admins.
- **Ergebnisse**: Unter `/results` gibt es eine Übersicht aller laufenden und
  beendeten Abstimmungen mit den jeweiligen Ergebnissen.
- **Admin-Backend** (`/admin`, nur für `ADMIN_EMAILS`): Assets anlegen/löschen,
  neue Abstimmungsrunden mit ausgewählten Assets anlegen, Runden öffnen/schließen
  und die Stimmenauswertung einsehen. Es kann jeweils nur eine Runde gleichzeitig
  offen sein.

## Nützliche Skripte

```bash
npm run dev         # Entwicklungsserver
npm run build       # Produktions-Build
npm run lint        # ESLint
npm run db:migrate  # Prisma-Migration ausführen
npm run db:seed     # Beispieldaten einspielen
```

## Deployment auf Vercel (empfohlen)

1. **Datenbank anlegen**: Kostenloses Postgres z. B. bei [Neon](https://neon.tech)
   oder [Supabase](https://supabase.com) erstellen und den Connection-String kopieren.
2. **Repo importieren**: Auf [vercel.com](https://vercel.com/new) das GitHub-Repo
   importieren. Vercel erkennt Next.js automatisch; das Build-Script
   (`vercel-build`) führt die Prisma-Migrationen bei jedem Deploy selbst aus.
3. **Umgebungsvariablen setzen** (Project Settings → Environment Variables):
   `DATABASE_URL`, `ADMIN_EMAILS`, `SESSION_SECRET` – und für echten Mailversand
   die `SMTP_*`-Variablen.
4. **Deploy** klicken. Fertig.

Ohne SMTP-Konfiguration werden die Login-Codes in die Vercel-Function-Logs
geschrieben (Dashboard → Deployment → Logs) – das reicht zum Testen, für echte
Nutzer sollten SMTP-Zugangsdaten (z. B. Brevo, Resend, Mailgun) hinterlegt werden.
