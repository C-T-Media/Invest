# Community Invest Voting

Eine Webseite, mit der eine Community per E-Mail-Anmeldung darüber abstimmen kann,
in welche Assets (ETF, Aktien, Krypto, ...) als Nächstes investiert werden soll.
Ein Admin-Bereich zeigt die ausgewertete Abstimmung im Backend an.

## Tech-Stack

- **Next.js (App Router, TypeScript)** – Frontend & API-Routes in einer Codebasis
- **Prisma + SQLite** – Datenhaltung in einer lokalen `dev.db`-Datei
- **E-Mail + Bestätigungscode** – Login ohne Passwort, 6-stelliger Code per Mail (10 Min. gültig)
- **Nodemailer** – Mailversand; ohne SMTP-Konfiguration wird der Code stattdessen in die Server-Konsole geloggt (praktisch für lokale Entwicklung)

## Setup

```bash
npm install
cp .env.example .env   # anpassen: ADMIN_EMAILS, SESSION_SECRET, ggf. SMTP_*
npx prisma migrate dev
npm run db:seed        # legt Beispiel-Assets + eine offene Demo-Abstimmung an
npm run dev
```

Die Seite läuft danach unter http://localhost:3000.

### Umgebungsvariablen (`.env`)

| Variable | Bedeutung |
|---|---|
| `DATABASE_URL` | Pfad zur SQLite-Datei, Standard `file:./dev.db` |
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

## Deployment-Hinweise

- SQLite eignet sich für den Start, ist aber an das Dateisystem gebunden – bei
  Deployment auf Plattformen mit ephemeren Dateisystemen (z. B. Vercel) braucht
  die `dev.db` einen persistenten Volume-Mount oder muss durch eine gehostete
  Datenbank (z. B. Postgres) ersetzt werden.
- Für den produktiven Mailversand SMTP-Zugangsdaten (z. B. von einem
  Transactional-E-Mail-Anbieter) in `SMTP_*` hinterlegen.
