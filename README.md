# Schreier Schmiddi Kniffli 🎲

Eine iPhone-optimierte Progressive Web App (PWA) für unser Spezial-Kniffel.

## Spielmodi

- **Gegen Schmiddi CPU** – Easy, Normal oder Psycho
- **2 iPhones online** – beide spielen dieselbe Runde parallel über einen Raumcode
- **Pass & Play** – zwei Spieler auf einem iPhone

## Spezial-Regeln

Der obere Teil bleibt klassisch. Ab **63 Punkten** gibt es **35 Bonuspunkte**.

Der untere Teil:

- 1 Paar = 10
- 2 Paare = 20
- Drilling = 15
- Vierling = 25
- Full House = 30
- Kleine Straße = 30
- Große Straße = 40
- Kniffli = 50
- Alle gerade = 20
- Alle ungerade = 20
- Exakter Wurf 15 = 15
- Exakter Wurf 20 = 20
- Chance = Augensumme

Insgesamt gibt es **19 Kategorien / 19 Runden**.

## Tech Stack

- React + TypeScript
- Vite
- PWA / Service Worker via `vite-plugin-pwa`
- Supabase Realtime für den Online-Modus
- Netlify für kostenloses Hosting
- Keine Datenbank nötig

## Lokal starten

```bash
npm install
cp .env.example .env
npm run dev
```

CPU und Pass & Play funktionieren auch ohne Supabase. Für Online-Matches die Supabase-Variablen in `.env` eintragen.

## Vor GitHub-Upload

Die Datei `.env` **nicht** committen. Sie ist bereits in `.gitignore`.

```bash
git init
git add .
git commit -m "Initial Schreier Schmiddi Kniffli PWA"
git branch -M main
git remote add origin DEINE_GITHUB_REPO_URL
git push -u origin main
```

## Netlify

Siehe [`NETLIFY_DEPLOY.md`](./NETLIFY_DEPLOY.md).

## Supabase / zwei iPhones

Siehe [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md).

## Auf dem iPhone installieren

1. Die Netlify-URL in **Safari** öffnen.
2. Teilen-Symbol antippen.
3. **Zum Home-Bildschirm** wählen.
4. Kniffli startet danach als eigenständige Vollbild-PWA.

## Qualität prüfen

```bash
npm test
npm run build
```

## Für Claude weiterentwickeln

Der vollständige Übergabe-Prompt steht in [`CLAUDE_PROMPT.md`](./CLAUDE_PROMPT.md).
