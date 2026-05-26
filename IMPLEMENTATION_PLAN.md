# Portfolio V3 — Vue 3 + Express.js — Implementation Plan

> Référence design : `./design/project/` — fichiers JSX + CSS à lire avant chaque composant.  
> Suivi des tâches : `PROGRESS.md`

---

## Objectif

Portfolio personnel mono-page + backoffice admin avec :
- **Frontend** : Vue 3 Options API · Vite · Vanilla CSS · Pinia · vue-i18n
- **Backend** : Express.js Clean Architecture · SQLite synchrone · Zod · JWT
- **Clé** : Toggles de sections + apparence entièrement configurable depuis l'admin

---

## Architecture Monorepo

```
portfolio-3-vue-express/
├── backend/
│   ├── src/
│   │   ├── config/          # database.ts, env.ts
│   │   ├── middleware/       # auth.ts, validate.ts, errorHandler.ts
│   │   ├── routes/          # *.routes.ts
│   │   ├── controllers/     # *.controller.ts
│   │   ├── services/        # *.service.ts
│   │   ├── models/          # *.model.ts (synchrones)
│   │   └── migrations/      # 001_initial.sql, 002_seed.sql
│   ├── uploads/
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── ui/          # AppButton, AppToggle, AppModal, AppToast, AppBadge
│   │   │   ├── sections/    # HeroSection, AboutSection, SkillsSection, ProjectsSection,
│   │   │   │                #   ExperienceEducationSection, ContactSection
│   │   │   └── admin/       # Composants admin réutilisables
│   │   ├── layouts/         # PublicLayout.vue, AdminLayout.vue
│   │   ├── router/          # index.ts
│   │   ├── stores/          # auth.ts, settings.ts, messages.ts
│   │   ├── views/
│   │   │   ├── public/      # HomeView.vue
│   │   │   └── admin/       # DashboardView, ProfileView, ProjectsView, ...
│   │   ├── lib/             # api.ts, types.ts, utils.ts
│   │   ├── i18n/            # fr.json, en.json, index.ts
│   │   ├── App.vue
│   │   ├── main.ts
│   │   └── style.css        # Reset + tokens + 4 thèmes + variants data-*
│   ├── index.html           # Charge Inter, Fraunces, Playfair, Space Grotesk, JetBrains Mono
│   ├── package.json
│   └── vite.config.ts       # Proxy /api → :3000
├── design/                  # RÉFÉRENCE — lire avant de coder le frontend
├── docker/
├── start.sh
├── CLAUDE.md
├── PROGRESS.md
└── IMPLEMENTATION_PLAN.md
```

---

## Phase 1 — Backend

### Dépendances
```
express better-sqlite3 zod jsonwebtoken bcryptjs
helmet cors express-rate-limit multer nodemailer dotenv tsx
```
Types : `@types/express @types/better-sqlite3 @types/jsonwebtoken @types/bcryptjs @types/multer`

### `src/config/env.ts`
Zod schema : `PORT`, `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`

### `src/config/database.ts`
Connexion `better-sqlite3` (synchrone). Auto-run des migrations SQL au démarrage via lecture + exécution séquentielle des fichiers `migrations/*.sql`.

### `src/migrations/001_initial.sql`

```sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS profile (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT, title TEXT, bio TEXT,
  email TEXT, phone TEXT, location TEXT,
  avatar_url TEXT, cv_url TEXT,
  available_for_work INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title_fr TEXT, title_en TEXT,
  description_fr TEXT, description_en TEXT,
  short_description_fr TEXT, short_description_en TEXT,
  image_url TEXT, demo_url TEXT, repo_url TEXT,
  technologies TEXT,  -- JSON array stringifié
  category TEXT,      -- 'web' | 'tools' | 'mobile'
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS project_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS experiences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company TEXT, role_fr TEXT, role_en TEXT,
  description_fr TEXT, description_en TEXT,
  start_date TEXT, end_date TEXT,
  current INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS education (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  school TEXT, degree_fr TEXT, degree_en TEXT,
  description_fr TEXT, description_en TEXT,
  start_date TEXT, end_date TEXT,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT, icon TEXT,
  category_fr TEXT, category_en TEXT,
  level INTEGER DEFAULT 50,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS translations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lang TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  UNIQUE(lang, key)
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT, email TEXT, subject TEXT, message TEXT,
  is_read INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS page_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  path TEXT, user_agent TEXT, ip_hash TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

### `src/migrations/002_seed.sql`

```sql
-- Compte admin (username/password depuis variables d'environnement)
INSERT OR IGNORE INTO users (username, password_hash)
VALUES (:username, :password_hash);

-- Settings par défaut
INSERT OR IGNORE INTO settings VALUES ('section_hero_enabled',       'true');
INSERT OR IGNORE INTO settings VALUES ('section_about_enabled',      'true');
INSERT OR IGNORE INTO settings VALUES ('section_skills_enabled',     'true');
INSERT OR IGNORE INTO settings VALUES ('section_projects_enabled',   'true');
INSERT OR IGNORE INTO settings VALUES ('section_experience_enabled', 'true');
INSERT OR IGNORE INTO settings VALUES ('section_education_enabled',  'true');
INSERT OR IGNORE INTO settings VALUES ('section_contact_enabled',    'true');
INSERT OR IGNORE INTO settings VALUES ('site_title',                 'Mon Portfolio');
-- Apparence
INSERT OR IGNORE INTO settings VALUES ('active_theme',      'sable');
INSERT OR IGNORE INTO settings VALUES ('active_font',       'mono');
INSERT OR IGNORE INTO settings VALUES ('density',           'regular');
INSERT OR IGNORE INTO settings VALUES ('card_style',        'soft');
INSERT OR IGNORE INTO settings VALUES ('hero_style',        'split');
INSERT OR IGNORE INTO settings VALUES ('accent_intensity',  'warm');
```

### API Routes

| Entité | Routes publiques | Routes admin (JWT requis) |
|---|---|---|
| **Auth** | — | `POST /api/auth/login` |
| **Profile** | `GET /api/profile` | `PUT /api/admin/profile` |
| **Projects** | `GET /api/projects`, `GET /api/projects/:id` | `POST/PUT/DELETE /api/admin/projects/:id`, `POST/DELETE /api/admin/projects/:id/images` |
| **Experience** | `GET /api/experiences` | `POST/PUT/DELETE /api/admin/experiences/:id` |
| **Education** | `GET /api/education` | `POST/PUT/DELETE /api/admin/education/:id` |
| **Skills** | `GET /api/skills` | `POST/PUT/DELETE /api/admin/skills/:id` |
| **Translations** | `GET /api/translations/:lang` | `PUT /api/admin/translations` |
| **Settings** | `GET /api/settings` *(public)* | `PUT /api/admin/settings` |
| **Contact** | `POST /api/contact` | — |
| **Messages** | — | `GET /api/admin/messages`, `PUT /api/admin/messages/:id/read`, `DELETE /api/admin/messages/:id` |
| **Analytics** | `POST /api/track` *(rate-limited, max 1/s/IP)* | `GET /api/admin/analytics` |
| **Upload** | — | `POST /api/admin/upload` (Multer) |

### Middleware
- `auth.ts` — JWT verification
- `validate.ts` — Zod middleware générique (body/params/query)
- `errorHandler.ts` — Réponses d'erreur JSON cohérentes

### Architecture par entité
**Route → Controller → Service → Model**

- **Model** : requêtes SQLite synchrones (`db.prepare(...).get/all/run(...)`)
- **Service** : logique métier (ex: hash du mot de passe, envoi email Nodemailer)
- **Controller** : parse req, appelle service, retourne res JSON
- **Route** : applique middleware auth + validate, monte les controllers

---

## Phase 2 — Frontend Scaffolding

> Référence design : `design/project/styles.css`, `styles-public.css`, `styles-admin.css`, `tweaks.jsx`

### Initialisation
```bash
npx -y create-vue@latest --ts --router --pinia --eslint --prettier --bare ./frontend
```

### Fonts (index.html)
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Playfair+Display:ital,wght@0,500;0,600;1,500&family=Space+Grotesk:wght@400;500;600&display=swap" rel="stylesheet">
```

### `src/style.css`

CSS entry-point consolidant :

**Design tokens** (`--font-display`, `--font-sans`, `--radius-*`, `--shadow-*`, `--transition-*`)

**4 thèmes** via `[data-theme]` sur `<html>` :

| Clé | Ambiance |
|---|---|
| `sable` (défaut) | Crème / Terracotta |
| `foret` | Vert mousse / menthe |
| `crepuscule` | Rose poudré / mauve |
| `papier` | Blanc cassé / encre marine |

Chaque thème déclare :
```css
--color-bg-primary, --color-bg-secondary, --color-bg-card, --color-bg-nav
--color-accent, --color-accent-soft, --color-accent-hover, --color-accent-fg
--color-text-primary, --color-text-secondary, --color-text-muted
--color-border, --color-success, --color-error
--mesh-1, --mesh-2, --mesh-3  /* gradients pour le hero + about portrait */
```

**Variants `data-*`** (appliqués via le settings store sur `<html>`) :

| Attribut | Valeurs | Effet |
|---|---|---|
| `data-theme` | sable/foret/crepuscule/papier | Swap couleurs |
| `data-type` | fraunces/inter/playfair/mono | Swap `--font-display` + `--font-sans` |
| `data-density` | compact/regular/comfy | Padding sections + admin |
| `data-card` | soft/flat/glass | Style des cartes |
| `data-hero` | split/centered/minimal | Layout et taille du hero |
| `data-accent` | muted/warm/vivid | Intensité `--color-accent` |
| `data-available` | 1/0 | Affiche/masque badge "Disponible" |

**Animations** :
```css
@keyframes fade-up   { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:none; } }
@keyframes scale-in  { from { opacity:0; transform:scale(0.96); }     to { opacity:1; transform:none; } }
@keyframes pulse-dot { 0%,100% { box-shadow: 0 0 0 0 var(--color-success); } 50% { box-shadow: 0 0 0 6px transparent; } }

.fade-up  { animation: fade-up  700ms ease both; }
.scale-in { animation: scale-in 400ms ease both; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
```

### `src/lib/api.ts`
Client fetch centralisé — base URL (`/api`), injection auto du JWT depuis localStorage, gestion erreurs HTTP.

### `src/lib/types.ts`
Types TypeScript partagés : `Project`, `Experience`, `Education`, `Skill`, `Message`, `Settings`, `Profile`.

### `src/router/index.ts`
```
/            → HomeView           (public)
/login       → LoginView          (public)
/admin       → redirect /admin/dashboard
/admin/*     → AdminLayout + auth guard (lit JWT depuis store auth)
```
Routes admin : `dashboard`, `profile`, `projects`, `experience`, `education`, `skills`, `messages`, `translations`, `settings`

### Stores Pinia

**`auth.ts`**
- `token`, `isAuthenticated`
- `login(username, password)` → `POST /api/auth/login` → stocke JWT localStorage
- `logout()` → vide token, redirige `/login`

**`settings.ts`**
```ts
// State
settings: Record<string, string>

// Getters
isSectionEnabled(section: string): boolean
currentTheme: string
currentFont: string
density: string
cardStyle: string
heroStyle: string
accentIntensity: string

// Actions
fetchSettings()   // GET /api/settings
applyToDOM()      // applique tous les data-* sur document.documentElement
setTheme(v)       // PUT /api/admin/settings + applyToDOM()
updateSettings(patch: Record<string, string>)  // PUT /api/admin/settings
```

> `applyToDOM()` applique simultanément `data-theme`, `data-type`, `data-density`, `data-card`, `data-hero`, `data-accent`, et les variables CSS `--font-display`/`--font-sans` via `style.setProperty`.

**`messages.ts`**
- `unreadCount: number` — expose le badge sidebar
- `fetchMessages()` → `GET /api/admin/messages`

### Layouts

**`PublicLayout.vue`**
- Navbar sticky (voir Phase 3)
- `<slot/>` pour les sections
- Réhydrate settings au montage (`settings.fetchSettings()` + `settings.applyToDOM()`)

**`AdminLayout.vue`**
- Sidebar 256px (Pilotage / Contenu / Configuration)
- Topbar avec breadcrumb + barre de recherche décorative + actions
- `<slot/>` pour les vues admin

### Composants UI réutilisables
- `AppButton.vue` — variantes : primary, ghost, icon, sm
- `AppToggle.vue` — `.toggle` + `.toggle.on` en CSS pur
- `AppModal.vue` — overlay, trap focus, Escape, slot
- `AppToast.vue` — `position: fixed`, animation fade-up, auto-dismiss
- `AppBadge.vue` — chip, chip-neutral, status-dot

---

## Phase 3 — Portfolio Public

> Référence design : `design/project/public.jsx`, `styles-public.css`

### Navbar
- Sticky, `backdrop-filter: blur(18px)`
- Liens d'ancres dynamiques — seules les sections activées apparaissent
- Badge "Disponible" — masqué si `data-available="0"` (CSS), piloté par `profile.available_for_work`
- Language switcher FR/EN (store Pinia, persisté localStorage)
- Bouton icône `lock` → `/login` (admin)
- IntersectionObserver pour indiquer la section active

### `HomeView.vue`
```vue
<PublicLayout>
  <HeroSection v-if="settings.isSectionEnabled('hero')" id="hero"/>
  <div v-if="settings.isSectionEnabled('about')" class="section-divider"/>
  <AboutSection v-if="settings.isSectionEnabled('about')" id="about"/>
  <div v-if="settings.isSectionEnabled('skills')" class="section-divider"/>
  <SkillsSection v-if="settings.isSectionEnabled('skills')" id="skills"/>
  <div v-if="settings.isSectionEnabled('projects')" class="section-divider"/>
  <ProjectsSection v-if="settings.isSectionEnabled('projects')" id="projects"/>
  <div v-if="expEduVisible" class="section-divider"/>
  <ExperienceEducationSection v-if="expEduVisible" id="experience"/>
  <ContactSection v-if="settings.isSectionEnabled('contact')"/>
  <Footer/>
</PublicLayout>
```
`expEduVisible` = `isSectionEnabled('experience') || isSectionEnabled('education')`

### Sections

| Composant | Points clés |
|---|---|
| `HeroSection.vue` | `min-height: calc(100vh - 73px)`, `hero-mesh` (radial gradients via `--mesh-*`), `hero-grid` (grille masquée), greeting badge, titre `clamp(3rem, 7vw, 5.5rem)`, meta row (Disponibilité / Stack), animation `fade-up` séquentielle |
| `AboutSection.vue` | Grid 1fr + 1.3fr, portrait placeholder gradient (`--mesh-1` + `--mesh-3`), stats 3 colonnes |
| `SkillsSection.vue` | Grid 3 colonnes de cards, skill bars larges 4px — animées **par IntersectionObserver** (width 0 → data-level% au scroll) |
| `ProjectsSection.vue` | Grid 3 colonnes, filter tabs, card avec aspect-ratio 16/11, click → `ProjectModal` |
| `ExperienceEducationSection.vue` | **Section unique** avec grid 2 colonnes (exp gauche + edu droite). Si seul `experience` activé → 1 colonne. `timeline` avec `::before` ligne verticale, dot plein si `.current` |
| `ContactSection.vue` | Grid 1fr + 1.2fr, channels (email/linkedin/github), formulaire `contact-form` avec `POST /api/contact` |
| `Footer.vue` | Flex space-between, icônes sociales `btn-icon` |

### Modale Projet (`ProjectModal.vue`)
- Gallery `aspect-ratio: 16/9` avec dots navigables
- Modal body : chip tag, titre, meta (client/rôle/année), description, techs, boutons demo/repo
- Fermeture : overlay click, Escape, bouton X
- Animation : `scale-in 350ms cubic-bezier(.2,.8,.2,1)` à l'entrée

### Analytics
- `POST /api/track` à chaque route change (Vue Router afterEach), debounce 500ms
- Payload : `{ path, user_agent }`

---

## Phase 4 — Multilingue

- Setup **vue-i18n** dans `main.ts`
- `i18n/fr.json` + `i18n/en.json` : traductions statiques de l'interface
- Au chargement : fetch `GET /api/translations/:lang`, merge par-dessus les JSON statiques
- Fallback : si API indisponible, JSON statiques seuls
- Language switcher dans la navbar : store Pinia `locale`, persisté localStorage
- Toutes les sections utilisent `$t('key')`

---

## Phase 5 — Admin Backoffice

> Référence design : `design/project/admin.jsx`, `styles-admin.css`

### `AdminLayout.vue`
- Grid `256px 1fr`
- **Sidebar** : brand mark (lettre "A"), sections Pilotage / Contenu / Configuration, badge unread sur Messages, pied (avatar initiales + nom + rôle + logout)
- **Topbar** : breadcrumb, barre de recherche décorative (disabled, `⌘K`), actions (bell icon + avatar)

### `DashboardView.vue`
- **Stat cards** (grid 4 col) : nb projets, nb expériences, messages non-lus, sections actives
- **Line chart SVG maison** : polyline lissée + polygon aire + circles dots + labels jours. Données : `GET /api/admin/analytics` (7 derniers jours)
- **Derniers messages** : 3 derniers, format mini-liste (avatar initiales + nom + sujet + temps relatif)

### `SettingsView.vue` — Vue clé

**1. Thème** — 4 cards cliquables avec `theme-swatch` (dégradés via couleurs du thème). Clic → `settings.setTheme(id)`

**2. Typographie** — Radio buttons : `fraunces` (Fraunces + Inter) · `inter` (Inter seul) · `playfair` (Playfair + Inter) · `mono` (Space Grotesk + JetBrains Mono, **défaut**)

**3. Mise en page** — Selects/radios pour :
- `density` : compact / regular / comfy
- `card_style` : soft / flat / glass
- `hero_style` : split / centered / minimal
- `accent_intensity` : muted / warm / vivid

**4. Sections visibles** — Toggle rows pour chaque section (hero, about, skills, projects, experience, education, contact)

**5. Général** — Input titre du site

Bouton "Sauvegarder" → `PUT /api/admin/settings` → `settings.applyToDOM()`

### Autres vues admin (pattern commun)

Table données + bouton "Nouveau" → AppModal create/edit + validation Zod client + AppToast feedback.

- `ProjectsView.vue` : CRUD + upload images multiples par projet
- `ExperienceView.vue`, `EducationView.vue`, `SkillsView.vue` : CRUD simple
- `MessagesView.vue` : liste avec dot unread/read, expansion inline (clic sur ligne), actions marquer lu + supprimer, badge count dans sidebar
- `TranslationsView.vue` : tableau éditable clé/valeur, tabs FR/EN
- `ProfileView.vue` : formulaire profil + upload avatar + upload CV + toggle `available_for_work`

---

## Phase 6 — Docker & Déploiement

### `docker/Dockerfile` (multi-stage)
```dockerfile
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --production
COPY backend/src ./src
COPY --from=frontend-build /app/frontend/dist ./public
EXPOSE 3000
CMD ["node", "--import", "tsx/esm", "src/index.ts"]
```

### `docker/docker-compose.yml`
```yaml
services:
  portfolio:
    build: { context: .., dockerfile: docker/Dockerfile }
    ports: ["3000:3000"]
    volumes:
      - ./data/database.sqlite:/app/database.sqlite
      - ./data/uploads:/app/uploads
    env_file: [.env]
    restart: unless-stopped
```

En production : Express sert `./public` (SPA fallback) + `./uploads` en statique.

---

## Ordre d'implémentation

1. **Phase 1** — Backend complet + tests API manuels (curl / Insomnia)
2. **Phase 2** — Scaffolding + `style.css` + stores + router + layouts + composants UI
3. **Phase 3** — Sections publiques + modale projet + analytics (vérifier dans navigateur)
4. **Phase 4** — i18n hybride + language switcher
5. **Phase 5** — Admin backoffice (commencer par dashboard + settings + messages)
6. **Phase 6** — Docker + tests de build

> Avancement tâche par tâche dans **`PROGRESS.md`**.
