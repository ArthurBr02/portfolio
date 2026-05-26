# CLAUDE.md — Portfolio V3 Vue + Express

## Stack

| Côté | Techno |
|---|---|
| Frontend | Vue 3 Options API · Vite · Vanilla CSS · Pinia · vue-i18n |
| Backend | Express.js · TypeScript (tsx) · SQLite (better-sqlite3) · Zod · JWT |

---

## Contraintes absolues — ne jamais violer

| Interdit | Alternatif |
|---|---|
| Tailwind CSS ou tout framework CSS | Vanilla CSS + custom properties |
| `<script setup>` / Composition API | Options API (`data()`, `methods`, `computed`, `watch`) |
| GSAP, Motion for Vue, toute lib animation | CSS natif (`@keyframes`, transitions) |
| Chart.js, D3 ou toute lib graphique | SVG ou Canvas maison |
| `async/await` dans `backend/src/models/` | `better-sqlite3` est synchrone — appels directs |
| Route d'inscription admin | Compte créé via `002_seed.sql` uniquement |

---

## Design

Tout le design est dans **`./design/project/`** :
- `styles.css` — tokens, 4 thèmes, animations globales
- `styles-public.css` — composants publics (nav, hero, sections, modal)
- `styles-admin.css` — composants admin (sidebar, table, chart, settings)
- `public.jsx` — structure des composants publics
- `admin.jsx` — structure des composants admin
- `data.jsx` — mock data + icônes SVG + sectionsList

Lire le fichier correspondant **avant** d'implémenter tout composant.

---

## Système de thèmes et d'apparence

Le frontend applique des `data-*` sur `<html>` à partir des settings lus en DB. Tout le style découle du CSS sans JavaScript supplémentaire.

| Attribut | Valeurs | Défaut |
|---|---|---|
| `data-theme` | sable / foret / crepuscule / papier | sable |
| `data-type` | fraunces / inter / playfair / mono | mono |
| `data-density` | compact / regular / comfy | regular |
| `data-card` | soft / flat / glass | soft |
| `data-hero` | split / centered / minimal | split |
| `data-accent` | muted / warm / vivid | warm |
| `data-available` | 1 / 0 | depuis `profile.available_for_work` |

Le store `settings.ts` expose `applyToDOM()` qui écrit tous ces attributs + les CSS vars `--font-display` et `--font-sans` via `style.setProperty`.

### Variables CSS par thème
```
--color-bg-primary    --color-bg-secondary  --color-bg-card  --color-bg-nav
--color-accent        --color-accent-soft   --color-accent-hover  --color-accent-fg
--color-text-primary  --color-text-secondary  --color-text-muted
--color-border        --color-success        --color-error
--mesh-1  --mesh-2  --mesh-3
```

### Fonts chargées (index.html)
Fraunces · Inter · JetBrains Mono · Playfair Display · Space Grotesk

---

## Architecture backend

**Route → Controller → Service → Model**

- `models/` : requêtes SQLite synchrones (`db.prepare(...).get/all/run(...)`) — pas d'async
- `services/` : logique métier (ex: `bcrypt.hash`, `nodemailer.sendMail`)
- `controllers/` : parse req → appelle service → retourne res JSON
- `routes/` : applique middleware `auth` + `validate(schema)` → monte controller

### Settings DB (table key-value)
```
section_hero_enabled, section_about_enabled, section_skills_enabled,
section_projects_enabled, section_experience_enabled, section_education_enabled,
section_contact_enabled, site_title,
active_theme, active_font, density, card_style, hero_style, accent_intensity
```

---

## Architecture frontend notable

### Experience + Education : composant fusionné
`ExperienceEducationSection.vue` affiche les deux timelines côte à côte. S'il n'y a qu'une des deux activées, une seule colonne. Si les deux sont désactivées, la section est masquée depuis `HomeView`.

### Skill bars : IntersectionObserver
Les barres démarrent à `width: 0`, elles s'animent (`transition: width 1.2s`) quand `.skills-cat` entre dans le viewport. Pas de lib d'animation.

### Admin search bar
La barre de recherche dans la topbar admin est **décorative** (input `disabled`). Non fonctionnelle v1.

### Chart Dashboard
SVG maison : polyline (ligne) + polygon (aire) + circles (dots) + text (labels). Données de `GET /api/admin/analytics`.

---

## Commandes

```bash
./start.sh              # Lance backend (:3000) + frontend (:5173) en parallèle
cd backend && npm run dev
cd frontend && npm run dev
```

### Variables d'environnement — `backend/.env`
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

## Flux de travail

1. Consulter `PROGRESS.md` — trouver la prochaine tâche
2. Lire le fichier `design/project/*.jsx|css` correspondant
3. Implémenter
4. Tester dans le navigateur (les deux serveurs actifs)
5. Cocher dans `PROGRESS.md`
