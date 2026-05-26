# Portfolio V2 — Vue 3 + Express.js — Implementation Plan

## Objectif

Repartir de zéro pour construire un portfolio moderne et minimaliste avec :
- **Frontend** : Vue 3 (Options API) + Vite + Vanilla CSS + Pinia
- **Backend** : Express.js restructuré en Clean Architecture + SQLite + Zod
- **Fonctionnalité clé** : Activation/désactivation dynamique des sections du portfolio depuis le backoffice (toggles)

---

## Architecture Monorepo

Monorepo simple avec un `package.json` par côté + script de démarrage à la racine.

```
portfolio-3-vue-express/
├── backend/
│   ├── src/
│   │   ├── config/          # DB connection, env vars, constants
│   │   ├── middleware/       # auth, validation, error handler, rate-limit
│   │   ├── routes/          # Express route definitions
│   │   ├── controllers/     # Thin HTTP handlers
│   │   ├── services/        # Business logic
│   │   ├── models/          # SQLite queries (data access layer)
│   │   ├── migrations/      # SQL migration files
│   │   └── index.ts         # Express app entry
│   ├── uploads/             # Local file storage (Multer)
│   ├── database.sqlite      # SQLite database
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── assets/          # Static assets, fonts
│   │   ├── components/
│   │   │   ├── ui/          # Reusable UI (Button, Toggle, Card, Modal, Toast...)
│   │   │   ├── sections/    # Portfolio sections (Hero, About, Skills, Projects...)
│   │   │   └── admin/       # Admin-specific components
│   │   ├── composables/     # Shared logic (useApi, useToast, useTheme...)
│   │   ├── layouts/         # PublicLayout, AdminLayout
│   │   ├── router/          # Vue Router config
│   │   ├── stores/          # Pinia stores
│   │   ├── views/           # Page components
│   │   │   ├── public/      # HomeView
│   │   │   └── admin/       # Dashboard, Settings, CRUD views, Messages
│   │   ├── lib/             # Utils, API client, types
│   │   ├── i18n/            # vue-i18n setup + static JSON translations (FR/EN)
│   │   ├── App.vue
│   │   ├── main.ts
│   │   └── style.css        # Vanilla CSS entry + design tokens + themes
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── docker/
│   ├── Dockerfile           # Multi-stage build (frontend build + backend runtime)
│   └── docker-compose.yml   # Services: app + volumes for uploads/db
├── start.sh                 # Dev convenience script to start both
├── ETAT_DES_LIEUX.md
├── IMPLEMENTATION_PLAN.md
└── .gitignore
```

---

## Phase 1 — Backend (Clean Architecture + Settings + Analytics)

### Initialisation
- **Runtime** : Node.js + TypeScript (via `tsx` pour le dev)
- **Dependencies** : `express`, `better-sqlite3`, `zod`, `jsonwebtoken`, `bcryptjs`, `helmet`, `cors`, `express-rate-limit`, `multer`, `nodemailer`, `dotenv`

### Config
- `src/config/database.ts` — SQLite connection via `better-sqlite3` (synchronous), auto-run migrations on startup
- `src/config/env.ts` — Zod schema to validate env vars at startup (PORT, JWT_SECRET, SMTP config, ADMIN_USERNAME, ADMIN_PASSWORD pour le seed initial)

### Migration SQL (001_initial.sql)

Tables :
- `users` — id, username, password_hash, created_at
- `profile` — id, name, title, bio, email, phone, location, avatar_url, cv_url, **available_for_work** (boolean) - **IMPORTANT** available for work peut être lié à linkedin pour que ce soit automatique en fonction du statut likedin
- `projects` — id, title_fr, title_en, description_fr, description_en, **short_description_fr, short_description_en**, image_url, demo_url, repo_url, technologies, category, sort_order, created_at
- **`project_images`** — id, project_id (FK), image_url, sort_order *(galerie multi-images pour la modale de détail)*
- `experiences` — id, company, role_fr, role_en, description_fr, description_en, start_date, end_date, current, sort_order
- `education` — id, school, degree_fr, degree_en, description_fr, description_en, start_date, end_date, sort_order
- `skills` — id, name, icon, category_fr, category_en, level, sort_order
- `translations` — id, lang, key, value
- **`messages`** — id, name, email, subject, message, **is_read** (boolean, default false), created_at *(messages du formulaire de contact)*
- **`page_views`** — id, path, user_agent, ip_hash, created_at *(analytics de navigation maison)*
- **`settings`** — key (PK), value (TEXT). Key-value store pour la configuration :
  - `section_hero_enabled` → `"true"`
  - `section_about_enabled` → `"true"`
  - `section_skills_enabled` → `"true"`
  - `section_projects_enabled` → `"true"`
  - `section_experience_enabled` → `"true"`
  - `section_education_enabled` → `"true"`
  - `section_contact_enabled` → `"true"`
  - `site_title` → `"Mon Portfolio"`
  - `active_theme` → `"sable"` ← thème actif parmi les 4 presets

### Seed SQL (002_seed.sql)

- Insertion du **compte admin** : username et password hashé depuis les variables d'environnement (`ADMIN_USERNAME`, `ADMIN_PASSWORD`). Pas de route d'inscription.
- Insertion des **settings par défaut** (toutes les sections activées, thème "sable").

### Middleware
- `auth.ts` — JWT verification
- `validate.ts` — Generic Zod validation middleware (body, params, query)
- `errorHandler.ts` — Centralized error handling, consistent JSON responses

### API Routes

| Entity | Public Routes | Admin Routes |
|---|---|---|
| **Auth** | — | `POST /api/auth/login` |
| **Profile** | `GET /api/profile` | `PUT /api/admin/profile` |
| **Projects** | `GET /api/projects`, `GET /api/projects/:id` | `POST/PUT/DELETE /api/admin/projects`, `POST/DELETE /api/admin/projects/:id/images` |
| **Experience** | `GET /api/experiences` | `POST/PUT/DELETE /api/admin/experiences` |
| **Education** | `GET /api/education` | `POST/PUT/DELETE /api/admin/education` |
| **Skills** | `GET /api/skills` | `POST/PUT/DELETE /api/admin/skills` |
| **Translations** | `GET /api/translations/:lang` | `PUT /api/admin/translations` |
| **Settings** | `GET /api/settings` | `PUT /api/admin/settings` |
| **Contact** | `POST /api/contact` | — |
| **Messages** | — | `GET /api/admin/messages`, `PUT /api/admin/messages/:id/read`, `DELETE /api/admin/messages/:id` |
| **Analytics** | `POST /api/track` *(public, rate-limited)* | `GET /api/admin/analytics` *(stats agrégées)* |
| **Upload** | — | `POST /api/admin/upload` |

> `GET /api/settings` est public (le frontend a besoin de savoir quelles sections afficher).
> `POST /api/track` est public mais fortement rate-limited (max 1 req/s par IP).
> Tous les endpoints `/api/admin/*` sont protégés par JWT.

### Architecture par entité
Chaque entité suit le pattern : **Route → Controller → Service → Model**
- **Route** : Définit les endpoints, applique middleware (auth, validation)
- **Controller** : Parse la requête, appelle le service, retourne la réponse HTTP
- **Service** : Logique métier (ex: envoi d'email de notification après réception d'un message)
- **Model** : Requêtes SQLite (data access layer)

---

## Phase 2 — Frontend Scaffolding

> **Design** : Toutes les specs visuelles (maquettes, palettes, composants) sont dans **`./design/`**.  
> Consulter ce dossier avant d'implémenter tout composant ou section.

### Initialisation
```bash
npx -y create-vue@latest --ts --router --pinia --eslint --prettier --bare ./frontend
```

### Vanilla CSS (pas de Tailwind)

Le design repose **entièrement sur du CSS custom** avec des custom properties. Aucun framework CSS.

- `style.css` : Reset, design tokens (`--color-*`, `--font-*`, `--spacing-*`, `--radius-*`), animations globales, composants de base
- Chaque composant `.vue` utilise des `<style scoped>` avec les custom properties du thème

### Design System — Multi-thème (style.css)

Le design repose sur des **CSS custom properties** (`--color-*`). Changer de thème = changer un attribut `data-theme` sur `<html>`, ce qui swap toutes les variables d'un coup.

**Thème par défaut : "Sable"** — palette chaude, douce, beige/terracotta.

```css
/* ═══════════════════════════════════════════════
   RESET + BASE
   ═══════════════════════════════════════════════ */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

@font-face {
  font-family: 'Inter';
  src: url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
}

:root {
  --font-sans: 'Inter', system-ui, sans-serif;
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --radius-full: 9999px;
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 2rem;
  --spacing-xl: 4rem;
  --shadow-sm: 0 1px 3px oklch(0 0 0 / 0.08);
  --shadow-md: 0 4px 12px oklch(0 0 0 / 0.1);
  --shadow-lg: 0 12px 40px oklch(0 0 0 / 0.12);
  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
  --transition-slow: 400ms ease;
}

/* ═══════════════════════════════════════
   THÈME : Sable (défaut)
   Palette douce beige / terracotta / crème
   ═══════════════════════════════════════ */
:root, [data-theme="sable"] {
  --color-bg-primary:    oklch(0.97 0.01 80);
  --color-bg-secondary:  oklch(0.93 0.02 75);
  --color-bg-card:       oklch(0.95 0.015 78);
  --color-accent:        oklch(0.58 0.12 35);
  --color-accent-hover:  oklch(0.52 0.14 30);
  --color-text-primary:  oklch(0.25 0.02 50);
  --color-text-secondary:oklch(0.50 0.03 60);
  --color-border:        oklch(0.85 0.025 70);
  --color-success:       oklch(0.60 0.15 155);
  --color-error:         oklch(0.55 0.18 25);
  --color-bg-nav:        oklch(0.94 0.018 76);
}

/* ═══════════════════════════════════════
   THÈME : Forêt
   Vert profond / mousse / crème
   ═══════════════════════════════════════ */
[data-theme="foret"] {
  --color-bg-primary:    oklch(0.96 0.015 140);
  --color-bg-secondary:  oklch(0.92 0.025 145);
  --color-bg-card:       oklch(0.94 0.02 142);
  --color-accent:        oklch(0.45 0.12 160);
  --color-accent-hover:  oklch(0.40 0.14 155);
  --color-text-primary:  oklch(0.22 0.03 150);
  --color-text-secondary:oklch(0.48 0.04 148);
  --color-border:        oklch(0.84 0.03 143);
  --color-success:       oklch(0.58 0.16 150);
  --color-error:         oklch(0.55 0.18 25);
  --color-bg-nav:        oklch(0.93 0.022 141);
}

/* ═══════════════════════════════════════
   THÈME : Crépuscule
   Rose poudré / mauve / gris chaud
   ═══════════════════════════════════════ */
[data-theme="crepuscule"] {
  --color-bg-primary:    oklch(0.96 0.015 340);
  --color-bg-secondary:  oklch(0.92 0.025 335);
  --color-bg-card:       oklch(0.94 0.02 338);
  --color-accent:        oklch(0.55 0.14 350);
  --color-accent-hover:  oklch(0.50 0.16 345);
  --color-text-primary:  oklch(0.24 0.02 330);
  --color-text-secondary:oklch(0.50 0.03 335);
  --color-border:        oklch(0.85 0.02 338);
  --color-success:       oklch(0.60 0.15 155);
  --color-error:         oklch(0.55 0.20 15);
  --color-bg-nav:        oklch(0.93 0.018 337);
}

/* ═══════════════════════════════════════
   THÈME : Minuit
   Mode sombre élégant, accents cuivrés
   ═══════════════════════════════════════ */
[data-theme="minuit"] {
  --color-bg-primary:    oklch(0.18 0.015 60);
  --color-bg-secondary:  oklch(0.22 0.018 55);
  --color-bg-card:       oklch(0.25 0.02 58);
  --color-accent:        oklch(0.68 0.14 55);
  --color-accent-hover:  oklch(0.74 0.16 50);
  --color-text-primary:  oklch(0.92 0.01 70);
  --color-text-secondary:oklch(0.65 0.02 65);
  --color-border:        oklch(0.32 0.02 60);
  --color-success:       oklch(0.65 0.18 150);
  --color-error:         oklch(0.60 0.22 25);
  --color-bg-nav:        oklch(0.16 0.012 58);
}

/* ═══════════════════════════════════════
   ANIMATIONS — CSS natif (scroll-driven)
   ═══════════════════════════════════════ */
@keyframes fade-up {
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes scale-in {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}

.animate-on-scroll {
  animation: fade-up ease both;
  animation-timeline: view();
  animation-range: entry 0% entry 30%;
}

.animate-scale-on-scroll {
  animation: scale-in ease both;
  animation-timeline: view();
  animation-range: entry 0% entry 30%;
}

@media (prefers-reduced-motion: reduce) {
  .animate-on-scroll,
  .animate-scale-on-scroll {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
```

**Mécanisme** :
- Le frontend lit `active_theme` depuis `GET /api/settings` et applique `document.documentElement.dataset.theme = theme`
- Le store Pinia `settings` expose `currentTheme` et `setTheme()`
- Tous les composants utilisent les variables CSS `var(--color-*)` → le changement est instantané, zéro rechargement

### Stores Pinia
- `auth.ts` — JWT auth state, login/logout, token persistence (localStorage)
- `settings.ts` — Fetch `/api/settings`, expose :
  - `isSectionEnabled(section: string): boolean`
  - `currentTheme: string` (réactif, applique `data-theme` sur `<html>`)
  - `setTheme(theme: string)` → met à jour le store + `PUT /api/admin/settings`
- `messages.ts` — Fetch `/api/admin/messages`, expose `unreadCount` pour le badge sidebar

### Router
- `/` → HomeView (public portfolio, single page scrollable)
- `/login` → LoginView
- `/admin` → AdminLayout (auth guard)
  - `/admin/dashboard` ← **Stats + graphique de visites**
  - `/admin/profile`
  - `/admin/projects`
  - `/admin/experience`
  - `/admin/education`
  - `/admin/skills`
  - `/admin/translations`
  - `/admin/messages` ← **Messages de contact (lu/non-lu)**
  - `/admin/settings` ← **Section toggles + thème**

---

## Phase 3 — Public Portfolio (Sections + Animations CSS natives)

### HomeView
Single-page layout avec rendu conditionnel et navbar sticky avec ancres :

```vue
<template>
  <PublicLayout>
    <HeroSection v-if="settings.isSectionEnabled('hero')" id="hero" />
    <AboutSection v-if="settings.isSectionEnabled('about')" id="about" />
    <SkillsSection v-if="settings.isSectionEnabled('skills')" id="skills" />
    <ProjectsSection v-if="settings.isSectionEnabled('projects')" id="projects" />
    <ExperienceSection v-if="settings.isSectionEnabled('experience')" id="experience" />
    <EducationSection v-if="settings.isSectionEnabled('education')" id="education" />
    <ContactSection v-if="settings.isSectionEnabled('contact')" id="contact" />
  </PublicLayout>
</template>
```

### Navbar publique
- **Sticky** en haut de page
- Liens d'ancres dynamiques (seules les sections activées apparaissent dans la navbar)
- **Badge "Disponible"** : pastille verte animée à côté du nom/logo si `profile.available_for_work === true`
- Language switcher (FR/EN)
- Indicateur de section active au scroll (intersection observer)

### Sections

| Component | Design |
|---|---|
| `HeroSection.vue` | Full-viewport, animated text reveal (CSS `@keyframes`), gradient mesh background dans les tons du thème, CTA buttons, badge "Disponible" |
| `AboutSection.vue` | Split layout (photo + bio), subtle parallax via `animation-timeline: scroll()` |
| `SkillsSection.vue` | Category cards avec skill bars animées au scroll (`animation-timeline: view()`) |
| `ProjectsSection.vue` | Grid avec hover cards, filter tabs par catégorie, **clic → modale de détail** avec galerie d'images |
| `ExperienceSection.vue` | Timeline verticale avec scroll-reveal entries (`animate-on-scroll`) |
| `EducationSection.vue` | Timeline compacte, même style que Experience |
| `ContactSection.vue` | Formulaire avec validation côté client + envoi vers `POST /api/contact`, liens sociaux |

### Modale de détail Projet
- S'ouvre au clic sur une card projet
- Contient : titre, description longue, **galerie d'images** (carrousel navigable), technologies, liens demo/repo
- Fermable via overlay click, touche Escape, bouton X
- Animation d'entrée/sortie CSS (`scale-in` + `fade`)

### Animations (100% CSS natif)
- **Scroll reveals** : CSS `animation-timeline: view()` via la classe `.animate-on-scroll`
- **Entry animations** : `@keyframes fade-up`, `scale-in` déclenchés au scroll
- **Hero text reveal** : `@keyframes` séquentiels avec `animation-delay`
- **Micro-interactions** : CSS `:hover` transitions, card lift (`transform: translateY(-4px)`, `box-shadow` teinté accent)
- **Smooth scroll** : `scroll-behavior: smooth` sur `html`
- **Accessibilité** : `prefers-reduced-motion: reduce` désactive toutes les animations

### Analytics tracking
- Le frontend envoie un `POST /api/track` à chaque navigation (path, user_agent)
- Debounce pour éviter le spam
- Pas de cookies, respect RGPD

---

## Phase 4 — Système Multilingue (i18n)

### Approche hybride
- **`vue-i18n`** comme moteur de traduction
- **Fichiers JSON statiques** (bundlés) : `i18n/fr.json`, `i18n/en.json` — contiennent les traductions de l'interface (boutons, labels, titres de section)
- **API dynamique** : `GET /api/translations/:lang` — permet de surcharger/éditer les traductions depuis l'admin
- Au chargement, les traductions API sont mergées par-dessus les traductions statiques (les clés API écrasent les clés statiques)
- **Fallback** : si l'API est indisponible, les traductions statiques sont utilisées

### Composant Language Switcher
- Bouton FR/EN dans la navbar
- Store Pinia pour gérer la locale courante (persistée en localStorage)

### Traductions dans l'admin
- Vue `/admin/translations` : tableau éditable des clés/valeurs par langue
- Possibilité d'ajouter, modifier, supprimer des traductions
- Preview en temps réel

---

## Phase 5 — Admin Backoffice

### Dashboard (`/admin/dashboard`)

```
┌──────────────────────────────────────────────────┐
│  📊  Tableau de Bord                              │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐   │
│  │   12   │ │    5   │ │    3   │ │    7   │   │
│  │ Projets│ │ Expér. │ │ Msg ✉️ │ │Sections│   │
│  └────────┘ └────────┘ └────────┘ └────────┘   │
│                                                  │
│  📈 Visites (7 derniers jours)                   │
│  ┌──────────────────────────────────────────┐   │
│  │  ▁ ▃ ▅ ▇ █ ▆ ▄  (graphique barres/line) │   │
│  │  L  M  M  J  V  S  D                     │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  📬 Derniers messages                            │
│  ── Jean D. — "Question sur le projet X" (2h)   │
│  ── Marie L. — "Proposition de mission" (1j)    │
│                                                  │
└──────────────────────────────────────────────────┘
```

- **Cards de stats** : nombre de projets, expériences, messages non-lus, sections actives
- **Graphique de visites** : barres ou courbe pour les 7/30 derniers jours (rendu en CSS/SVG maison ou Canvas simple, pas de lib externe)
- **Derniers messages** : aperçu des 3 derniers messages reçus

### SettingsView (`/admin/settings`) — Fonctionnalité clé

```
┌──────────────────────────────────────────────────┐
│  ⚙️  Configuration du Site                       │
├──────────────────────────────────────────────────┤
│                                                  │
│  🎨 Thème du site                                │
│  ────────────────                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│  │  ██████  │ │  ██████  │ │  ██████  │ │  ██████  │
│  │  Sable   │ │  Forêt   │ │Crépuscule│ │  Minuit  │
│  │  ✓ actif │ │          │ │          │ │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘
│  Cartes de preview avec couleurs du thème.       │
│  Clic = changement instantané + sauvegarde.      │
│                                                  │
│  📋 Sections Visibles                            │
│  ─────────────────                               │
│  Hero           [████████ ON ]                   │
│  À propos       [████████ ON ]                   │
│  Compétences    [████████ ON ]                   │
│  Projets        [████████ ON ]                   │
│  Expérience     [████████ ON ]                   │
│  Éducation      [        OFF]                   │
│  Contact        [████████ ON ]                   │
│                                                  │
│  🔧 Paramètres généraux                          │
│  ───────────────────                             │
│  Titre du site  [________________]               │
│                                                  │
│         [ 💾 Sauvegarder ]                       │
└──────────────────────────────────────────────────┘
```

### MessagesView (`/admin/messages`)

```
┌──────────────────────────────────────────────────┐
│  ✉️  Messages reçus                    3 non-lus │
├──────────────────────────────────────────────────┤
│                                                  │
│  ● Jean Dupont — jean@mail.com                   │
│    "Question sur le projet X"                    │
│    il y a 2 heures                    [🗑️] [👁️] │
│  ──────────────────────────────────────           │
│  ● Marie Lambert — marie@mail.com                │
│    "Proposition de mission freelance"            │
│    il y a 1 jour                      [🗑️] [👁️] │
│  ──────────────────────────────────────           │
│  ○ Pierre Martin — pierre@mail.com               │
│    "Super portfolio !"                           │
│    il y a 3 jours                     [🗑️]      │
│                                                  │
│  ● = non-lu    ○ = lu                            │
└──────────────────────────────────────────────────┘
```

- Liste des messages avec indicateur lu/non-lu
- Clic pour voir le message complet (expansion inline ou modale)
- Actions : marquer comme lu, supprimer
- Badge de notification sur "Messages" dans la sidebar admin (`unreadCount`)
- **Notification email** : envoi d'un email au propriétaire du portfolio à chaque nouveau message reçu (via Nodemailer)

### Autres vues admin
Pattern commun pour chaque entité :
- Table de données avec actions edit/delete
- Modal ou formulaire inline pour create/edit
- Validation Zod côté frontend (schémas partagés ou dupliqués)
- Toast notifications pour feedback
- **Projets** : gestion des images multiples (upload, réordonnement, suppression)

### Design Admin
- Sidebar navigation (dark theme, compact)
- Badge notification sur "Messages" (nombre non-lus)
- Top bar avec info utilisateur + logout
- Style minimaliste et cohérent avec le portfolio public (utilise les mêmes `--color-*`)

---

## Phase 6 — Docker & Déploiement

### Dockerfile (multi-stage)
```dockerfile
# Stage 1: Build frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Backend runtime
FROM node:20-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --production
COPY backend/ ./
COPY --from=frontend-build /app/frontend/dist ./public
EXPOSE 3000
CMD ["node", "--import", "tsx", "src/index.ts"]
```

### docker-compose.yml
```yaml
version: '3.8'
services:
  portfolio:
    build:
      context: .
      dockerfile: docker/Dockerfile
    ports:
      - "3000:3000"
    volumes:
      - ./data/database.sqlite:/app/database.sqlite
      - ./data/uploads:/app/uploads
    env_file:
      - .env
    restart: unless-stopped
```

### En production
- Express sert le frontend buildé depuis `./public` (SPA fallback)
- Express sert les uploads depuis `./uploads` en statique
- SQLite et uploads persistés via Docker volumes
- Variables d'environnement via `.env`

---

## Design Philosophy

### Palette de couleurs — Douce et Originale
Pas de bleu/violet/noir générique. Chaque thème est **chaud, doux et épuré** :

| Thème | Ambiance | Bg | Accent | Texte |
|---|---|---|---|---|
| **Sable** (défaut) | Crème / Terracotta | Ivoire chaud | Terracotta rosé | Brun doux |
| **Forêt** | Menthe / Mousse | Vert pâle | Vert forêt | Vert nuit |
| **Crépuscule** | Rose / Mauve | Rose poudré | Mauve profond | Aubergine |
| **Minuit** | Sombre / Cuivré | Noir chaud | Or cuivré | Ivoire |

Tous les thèmes utilisent l'espace couleur **oklch** pour des dégradés naturels et harmonieux.

### Système de thème
- 4 presets disponibles, extensibles facilement (ajouter un bloc `[data-theme="..."]` dans le CSS)
- Changement instantané depuis le backoffice via `data-theme` sur `<html>`
- Le thème actif est persisté en base (`settings.active_theme`)
- Possibilité d'ajouter de nouveaux thèmes sans toucher au code des composants

### Typography
- **Google Font** : Inter (variable weight, 400/500/600/700)
- **Headings** : Font-weight 700, letter-spacing -0.02em
- **Body** : Font-weight 400, line-height 1.6

### Key Design Elements
- Cards avec ombres douces et bords arrondis (effet glassmorphism subtil sur thème Minuit uniquement)
- Hero background avec dégradé mesh dans les tons du thème actif
- Smooth scroll (`scroll-behavior: smooth`)
- Section dividers avec lignes gradient discrètes
- Hover-lift doux sur les cards (`transform: translateY(-4px)`, `box-shadow` teinté accent)
- **Badge "Disponible"** : pastille verte animée (pulse) dans la navbar à côté du nom

---

## Plan d'Implémentation (Ordre)

1. **Phase 1** : Backend complet (Clean Architecture, toutes les tables, API, seed admin) + tests API manuels
2. **Phase 2** : Frontend scaffolding + design system Vanilla CSS + thèmes + stores Pinia
   - Référence : `./design/` pour toutes les specs visuelles
3. **Phase 3** : Sections publiques + animations CSS natives + modale projets + tracking analytics
   - Référence : `./design/` pour le design de chaque section
4. **Phase 4** : Système multilingue hybride (vue-i18n + API)
5. **Phase 5** : Admin backoffice (dashboard avec graphique, settings toggles, messages, CRUD)
   - Référence : `./design/` pour le design de l'admin
6. **Phase 6** : Docker + docker-compose + script de démarrage
7. **Vérification** : Test end-to-end du flux complet (toggle sections, changement thème, envoi message, analytics)

> Suivre l'avancement tâche par tâche dans **`PROGRESS.md`**.
