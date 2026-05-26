# PROGRESS.md — Portfolio V3

> Référence plan : `IMPLEMENTATION_PLAN.md`  
> Référence design : `./design/project/`  
> Cocher chaque tâche dès qu'elle est terminée.

---

## Phase 1 — Backend

### Init
- [ ] Créer `backend/` — `package.json`, `tsconfig.json`
- [ ] Installer dépendances : `express better-sqlite3 zod jsonwebtoken bcryptjs helmet cors express-rate-limit multer nodemailer dotenv tsx`
- [ ] Types : `@types/express @types/better-sqlite3 @types/jsonwebtoken @types/bcryptjs @types/multer`
- [ ] Créer `backend/.env` (ne pas commiter)
- [ ] Créer `start.sh` à la racine

### Config
- [ ] `src/config/env.ts` — Zod schema variables d'environnement
- [ ] `src/config/database.ts` — Connexion SQLite, auto-run migrations au démarrage

### Migrations
- [ ] `src/migrations/001_initial.sql` — Tables :
  - [ ] `users`
  - [ ] `profile`
  - [ ] `projects`
  - [ ] `project_images`
  - [ ] `experiences`
  - [ ] `education`
  - [ ] `skills`
  - [ ] `translations`
  - [ ] `messages`
  - [ ] `page_views`
  - [ ] `settings`
- [ ] `src/migrations/002_seed.sql` — Admin + 14 settings par défaut

### Middleware
- [ ] `src/middleware/auth.ts` — Vérification JWT
- [ ] `src/middleware/validate.ts` — Middleware Zod générique
- [ ] `src/middleware/errorHandler.ts` — Réponses d'erreur JSON centralisées

### API Auth
- [ ] `POST /api/auth/login`

### API Profile
- [ ] `GET /api/profile`
- [ ] `PUT /api/admin/profile`

### API Projects
- [ ] `GET /api/projects`
- [ ] `GET /api/projects/:id`
- [ ] `POST /api/admin/projects`
- [ ] `PUT /api/admin/projects/:id`
- [ ] `DELETE /api/admin/projects/:id`
- [ ] `POST /api/admin/projects/:id/images`
- [ ] `DELETE /api/admin/projects/:id/images/:imageId`

### API Experience
- [ ] `GET /api/experiences`
- [ ] `POST /api/admin/experiences`
- [ ] `PUT /api/admin/experiences/:id`
- [ ] `DELETE /api/admin/experiences/:id`

### API Education
- [ ] `GET /api/education`
- [ ] `POST /api/admin/education`
- [ ] `PUT /api/admin/education/:id`
- [ ] `DELETE /api/admin/education/:id`

### API Skills
- [ ] `GET /api/skills`
- [ ] `POST /api/admin/skills`
- [ ] `PUT /api/admin/skills/:id`
- [ ] `DELETE /api/admin/skills/:id`

### API Translations
- [ ] `GET /api/translations/:lang`
- [ ] `PUT /api/admin/translations`

### API Settings
- [ ] `GET /api/settings` (public)
- [ ] `PUT /api/admin/settings`

### API Contact & Messages
- [ ] `POST /api/contact` (Nodemailer)
- [ ] `GET /api/admin/messages`
- [ ] `PUT /api/admin/messages/:id/read`
- [ ] `DELETE /api/admin/messages/:id`

### API Analytics
- [ ] `POST /api/track` (public, rate-limited 1/s/IP)
- [ ] `GET /api/admin/analytics` (stats agrégées 7/30 jours)

### API Upload
- [ ] `POST /api/admin/upload` (Multer)

### Entrée
- [ ] `src/index.ts` — Express app, middlewares globaux, montage des routes, SPA fallback en prod

---

## Phase 2 — Frontend Scaffolding

### Init
- [ ] Scaffolding Vite + Vue 3 dans `frontend/`
- [ ] Installer : `vue-router pinia vue-i18n`
- [ ] `vite.config.ts` — proxy `/api` → `localhost:3000`
- [ ] `index.html` — `<link>` Google Fonts (Inter, Fraunces, JetBrains Mono, Playfair Display, Space Grotesk)

### Design system `src/style.css`
- [ ] Reset + base elements (`h1-h4`, `p`, `input`, `button`, `a`)
- [ ] Tokens globaux (`--radius-*`, `--shadow-*`, `--transition-*`)
- [ ] Thème `sable` — 15 variables CSS + `--mesh-1/2/3`
- [ ] Thème `foret`
- [ ] Thème `crepuscule`
- [ ] Thème `papier`
- [ ] Composants transverses : `.btn`, `.btn-primary`, `.btn-ghost`, `.btn-sm`, `.btn-icon`
- [ ] `.card`, `.card-hover`, `.chip`, `.chip-neutral`, `.status-dot`
- [ ] `.container`, `.section`, `.section-divider`, `.eyebrow`, `.h-section`
- [ ] Animations : `@keyframes fade-up`, `scale-in`, `pulse-dot`
- [ ] Classes `.fade-up`, `.scale-in` + `prefers-reduced-motion`
- [ ] Variants `data-density` (compact / regular / comfy)
- [ ] Variants `data-card` (soft / flat / glass)
- [ ] Variants `data-hero` (split / centered / minimal)
- [ ] Variants `data-type` (fraunces / inter / playfair / mono)
- [ ] Variants `data-accent` (muted / warm / vivid)
- [ ] Variant `data-available` (0/1 → masque badge)

### Lib & Types
- [ ] `src/lib/api.ts` — client fetch, JWT header auto, gestion erreurs
- [ ] `src/lib/types.ts` — tous les types TypeScript (Project, Skill, Message, Settings…)
- [ ] `src/lib/utils.ts` — helpers (formatDate, debounce, relativeTime…)

### Router
- [ ] `src/router/index.ts` — routes publiques + guard JWT admin

### Stores Pinia
- [ ] `src/stores/auth.ts` — login/logout, JWT localStorage
- [ ] `src/stores/settings.ts` — fetchSettings, isSectionEnabled, applyToDOM, setTheme, updateSettings
- [ ] `src/stores/messages.ts` — fetchMessages, unreadCount

### Layouts
- [ ] `src/layouts/PublicLayout.vue` — Navbar + slot + init settings au montage
- [ ] `src/layouts/AdminLayout.vue` — Sidebar + Topbar + slot

### i18n
- [ ] `src/i18n/fr.json`
- [ ] `src/i18n/en.json`
- [ ] `src/i18n/index.ts` — setup vue-i18n, merge API translations

### Composants UI
- [ ] `AppButton.vue`
- [ ] `AppToggle.vue`
- [ ] `AppModal.vue`
- [ ] `AppToast.vue`
- [ ] `AppBadge.vue`

---

## Phase 3 — Portfolio Public

### Navbar (dans PublicLayout)
- [ ] Sticky + `backdrop-filter: blur(18px)` + `--color-bg-nav`
- [ ] Liens d'ancres dynamiques (seules sections activées)
- [ ] Badge "Disponible" (`.nav-available` + `.status-dot`)
- [ ] Language switcher FR/EN
- [ ] Bouton icon lock → `/login`
- [ ] IntersectionObserver — section active

### HomeView
- [ ] `src/views/public/HomeView.vue` — assemblage conditionnel, dividers entre sections

### Sections
- [ ] `HeroSection.vue` — mesh + grid + greeting badge + h1 + lede + CTA + meta row + animations `fade-up` séquentielles
- [ ] `AboutSection.vue` — grid portrait + body + stats 3 col
- [ ] `SkillsSection.vue` — grid 3 cards, skill bars déclenchées par IntersectionObserver
- [ ] `ProjectsSection.vue` — grid 3 col + filter tabs + card thumb 16/11 + click → modal
- [ ] `ExperienceEducationSection.vue` — grid 2 col (exp + edu), timeline CSS, 1 col si 1 seul activé
- [ ] `ContactSection.vue` — grid 2 col, channels, formulaire, `POST /api/contact`
- [ ] `Footer.vue` — copyright + socials

### Modale Projet
- [ ] `ProjectModal.vue` — gallery 16/9 + dots + body + meta + techs + liens + scale-in CSS

### Analytics
- [ ] `POST /api/track` dans Vue Router `afterEach`, debounce 500ms

---

## Phase 4 — Multilingue

- [ ] Setup vue-i18n dans `main.ts`
- [ ] Fetch `GET /api/translations/:lang` au changement de langue + merge
- [ ] Language switcher (navbar) — store Pinia `locale`, localStorage
- [ ] Toutes les sections utilisent `$t()`

---

## Phase 5 — Admin Backoffice

### AdminLayout
- [ ] Sidebar : brand mark "A", groupes (Pilotage / Contenu / Configuration), badge messages, pied (avatar + nom + logout)
- [ ] Topbar : breadcrumb, barre de recherche décorative (disabled), bell icon

### Vues
- [ ] `LoginView.vue` — card centrée + mesh background + form username/password
- [ ] `DashboardView.vue` — 4 stat cards + line chart SVG + mini-liste 3 derniers messages
- [ ] `ProfileView.vue` — formulaire profil + upload avatar + upload CV + toggle `available_for_work`
- [ ] `ProjectsView.vue` — table + AppModal create/edit + gestion images
- [ ] `ExperienceView.vue` — table + AppModal create/edit
- [ ] `EducationView.vue` — table + AppModal create/edit
- [ ] `SkillsView.vue` — table + AppModal create/edit
- [ ] `TranslationsView.vue` — tableau éditable tabs FR/EN
- [ ] `MessagesView.vue` — liste unread/read + expansion inline + actions
- [ ] `SettingsView.vue` :
  - [ ] Sélecteur thème (4 cards `theme-swatch`)
  - [ ] Sélecteur font (4 options)
  - [ ] Sélecteur density / card_style / hero_style / accent_intensity
  - [ ] Toggles sections (7 toggle-rows)
  - [ ] Input titre du site
  - [ ] Bouton Sauvegarder → `PUT /api/admin/settings` + `applyToDOM()`

---

## Phase 6 — Docker & Déploiement

- [ ] `docker/Dockerfile` — multi-stage (build frontend → runtime backend)
- [ ] `docker/docker-compose.yml` — volumes SQLite + uploads
- [ ] Tester `docker-compose up` → portfolio sur port 3000

---

## Vérification finale

- [ ] Toggle section depuis admin → masquage immédiat côté public + navbar mise à jour
- [ ] Changement thème → instantané, persisté en base
- [ ] Changement font/density/card → appliqué immédiatement sur tout le site
- [ ] Envoi message contact → email reçu + message visible dans admin avec badge unread
- [ ] Analytics → visites comptées + line chart dashboard
- [ ] Multilingue → switch FR/EN, traductions admin éditables
- [ ] Auth → login, logout, guard routes admin
- [ ] Skill bars → animées au scroll (IntersectionObserver)
- [ ] Modale projet → galerie, fermeture overlay/Escape/X
- [ ] Docker → build complet fonctionnel
