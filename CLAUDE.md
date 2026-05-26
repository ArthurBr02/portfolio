# CLAUDE.md — Portfolio V3 Vue + Express

## Stack & Architecture

Monorepo : `backend/` + `frontend/` à la racine.

### Backend
- Node.js + TypeScript (`tsx` pour le dev, synchrone)
- Express.js — Clean Architecture : **Route → Controller → Service → Model**
- SQLite via `better-sqlite3` (**synchrone** — jamais d'async/await dans les models)
- Zod pour la validation des entrées et des variables d'environnement
- JWT (`jsonwebtoken`) pour l'authentification admin

### Frontend
- Vue 3 — **Options API uniquement** (jamais de `<script setup>` ni Composition API)
- Vite
- Vanilla CSS — custom properties (`--color-*`, `--spacing-*`, `--radius-*`, etc.)
- Pinia pour le state global
- vue-i18n pour le multilingue (hybride : JSON statiques + API)

---

## Contraintes absolues

Ne jamais violer ces règles, même si une lib semble plus rapide :

| Interdit | Alternatif obligatoire |
|---|---|
| Tailwind CSS ou tout framework CSS | Vanilla CSS + custom properties |
| `<script setup>` / Composition API | Options API (`data()`, `methods`, `computed`, `watch`) |
| GSAP, Motion for Vue, toute lib d'animation | CSS natif (`@keyframes`, `animation-timeline: view()`) |
| Chart.js, D3, ou toute lib graphique | SVG ou Canvas maison |
| `async/await` dans `backend/src/models/` | `better-sqlite3` est synchrone, appels directs |
| Route d'inscription admin | Compte créé via `002_seed.sql` uniquement |

---

## Design

Les spécifications visuelles (maquettes, palettes, specs de composants) sont dans **`./design/`**.

Avant d'implémenter tout composant ou section frontend, consulter le fichier correspondant dans `./design/`. Le CSS doit coller aux specs — couleurs, espacements, typographie.

---

## Thèmes CSS

4 thèmes déclarés dans `frontend/src/style.css` via `[data-theme]` sur `<html>` :

| Clé | Ambiance |
|---|---|
| `sable` (défaut) | Crème / Terracotta |
| `foret` | Vert mousse |
| `crepuscule` | Rose / Mauve |
| `minuit` | Sombre / Cuivré (glassmorphism subtil) |

Tous les composants utilisent `var(--color-*)` — jamais de couleurs hardcodées. Le changement de thème est instantané (swap de `data-theme`, zéro rechargement).

---

## Commandes de développement

```bash
# Depuis la racine — lance backend + frontend en parallèle
./start.sh

# Backend seul (port 3000)
cd backend && npm run dev

# Frontend seul (port 5173)
cd frontend && npm run dev
```

## Variables d'environnement

Fichier `backend/.env` (non commité) :

```
PORT=3000
JWT_SECRET=
ADMIN_USERNAME=
ADMIN_PASSWORD=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

---

## Migrations SQLite

Fichiers dans `backend/src/migrations/`, exécutés automatiquement au démarrage :

- `001_initial.sql` — Création de toutes les tables
- `002_seed.sql` — Compte admin + settings par défaut (toutes sections ON, thème `sable`)

---

## Flux de travail

1. Consulter `PROGRESS.md` — vérifier où on en est et quelle tâche prendre
2. Consulter `./design/` — lire les specs avant de coder le frontend
3. Implémenter la tâche
4. Tester manuellement (les deux serveurs doivent tourner)
5. Mettre à jour `PROGRESS.md` — cocher la tâche

---

## Structure du projet

```
portfolio-3-vue-express/
├── backend/
│   ├── src/
│   │   ├── config/          # database.ts, env.ts
│   │   ├── middleware/       # auth.ts, validate.ts, errorHandler.ts, rateLimit.ts
│   │   ├── routes/          # *.routes.ts
│   │   ├── controllers/     # *.controller.ts — handlers HTTP fins
│   │   ├── services/        # *.service.ts — logique métier
│   │   ├── models/          # *.model.ts — requêtes SQLite synchrones
│   │   └── migrations/      # 001_initial.sql, 002_seed.sql
│   ├── uploads/             # Fichiers uploadés (Multer)
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── ui/          # Button, Toggle, Card, Modal, Toast, ...
│   │   │   ├── sections/    # HeroSection, AboutSection, SkillsSection, ...
│   │   │   └── admin/       # Composants spécifiques à l'admin
│   │   ├── layouts/         # PublicLayout.vue, AdminLayout.vue
│   │   ├── router/          # index.ts — routes publiques + admin guard
│   │   ├── stores/          # auth.ts, settings.ts, messages.ts
│   │   ├── views/
│   │   │   ├── public/      # HomeView.vue
│   │   │   └── admin/       # DashboardView, SettingsView, ...
│   │   ├── lib/             # api.ts, types.ts, utils.ts
│   │   ├── i18n/            # fr.json, en.json, index.ts
│   │   ├── App.vue
│   │   ├── main.ts
│   │   └── style.css        # Reset + design tokens + 4 thèmes
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── design/                  # Maquettes et specs (référence frontend)
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── start.sh
├── CLAUDE.md                # Ce fichier
├── PROGRESS.md
└── IMPLEMENTATION_PLAN.md
```
