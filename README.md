<div align="center">

# Nexus ASPM

**Application security posture** — a Next.js control plane for DevSecOps workflows, findings, and integrations.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Node](https://img.shields.io/badge/node-%3E%3D20-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

</div>

---

## At a glance

| Step | What you do |
|------|-------------|
| 1 | Install **Node.js 20+** and **npm** |
| 2 | Clone or open this repository |
| 3 | Install packages (`npm install`) |
| 4 | *(Optional)* Create `.env.local` from `env.example` |
| 5 | Start the dev server (`npm run dev`) |
| 6 | Open **http://localhost:3000** in your browser |

The app redirects `/` → `/dashboard`. Some routes use cookie-based module gating; you can manage that from **Billing** in the UI if you hit a lock screen.

---

## Prerequisites

- **Node.js** **20** or newer ([nodejs.org](https://nodejs.org/) — LTS recommended)  
  Check: `node -v`
- **npm** (ships with Node)  
  Check: `npm -v`
- **Git** (only if you are cloning from a remote)

> **Windows:** Use PowerShell or Windows Terminal. You do not need WSL for this project.

---

## 1 · Get the code

**If you already have the folder on your machine**, open a terminal there, for example:

```powershell
cd path\to\this\repo
```

**If you clone from GitHub:**

```powershell
git clone https://github.com/YOUR_ORG/YOUR_REPO.git
cd YOUR_REPO
```

---

## 2 · Install dependencies

From the project root (where `package.json` lives):

```powershell
npm install
```

Wait until the command finishes with no errors. This creates `node_modules/` and updates `package-lock.json` if needed.

---

## 3 · Environment variables *(optional but recommended)*

Integrations (GitHub, Jira, ServiceNow, NVD, OpenAI, etc.) read from **server-side** env vars in Next.js.

1. Copy the example file:

   ```powershell
   copy env.example .env.local
   ```

2. Open `.env.local` in your editor and fill in the values you need.  
   See `env.example` for descriptions of each variable.

| Area | Variables (examples) | Required to *run* the UI? |
|------|-------------------------|----------------------------|
| Core dev server | *(none)* | **No** — `npm run dev` works without `.env.local` |
| GitHub | `GITHUB_TOKEN`, `GITHUB_DEFAULT_BRANCH` | No — enables dispatch / repo features when set |
| Jira | `JIRA_HOST`, `JIRA_EMAIL`, `JIRA_API_TOKEN` | No |
| ServiceNow | `SERVICENOW_INSTANCE`, `SERVICENOW_ACCESS_TOKEN` (or user/password) | No |
| NVD | `NVD_API_KEY` | No — higher rate limits when set |
| OpenAI | `OPENAI_API_KEY`, `OPENAI_MODEL` | No — AI remediation when set |

> **Security:** Never commit `.env.local`. It is listed in `.gitignore`.

After editing `.env.local`, **restart** the dev server so changes apply.

---

## 4 · Start the development server

```powershell
npm run dev
```

This project pins the dev port to **3000** (see `package.json` → `"dev": "next dev -p 3000"`).

You should see output similar to:

```text
▲ Next.js 16.x.x
- Local: http://localhost:3000
```

---

## 5 · Open the app in your browser

Go to:

**http://localhost:3000**

You should land on the dashboard (via redirect from `/`).

---

## Troubleshooting

| Issue | What to try |
|-------|----------------|
| **Port 3000 in use** | Stop the other app, or run `npx next dev -p 3001` and open that port instead *(note: overrides default script)* |
| **`npm` not found** | Reinstall Node and ensure “Add to PATH” was selected |
| **Module errors after `git pull`** | Run `npm install` again |
| **Env not picked up** | File must be named `.env.local` in the project root; restart `npm run dev` |

---

## Scripts reference

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server on **port 3000** |
| `npm run build` | Production build |
| `npm run start` | Serve the production build *(run `build` first)* |
| `npm run lint` | ESLint |

---

## Project layout *(short)*

| Path | Role |
|------|------|
| `src/app/` | App Router pages and API routes |
| `src/lib/` | Shared libraries and server helpers |
| `public/` | Static assets |
| `env.example` | Documented environment template |
| `middleware.ts` | Route protection / subscription gating |

---

<div align="center">

**You’re done when** `npm run dev` is running and **http://localhost:3000** loads in your browser.

</div>
