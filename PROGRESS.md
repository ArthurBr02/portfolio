# PROGRESS.md — Portfolio V3

> Référence plan : `IMPLEMENTATION_PLAN.md`  
> Référence design : `./design/project/`  
> Cocher chaque tâche dès qu'elle est terminée.

---

## Phase 1 — Backend

### Init
- [x] Créer `backend/` — `package.json`, `tsconfig.json`
- [x] Installer dépendances : `express better-sqlite3 zod jsonwebtoken bcryptjs helmet cors express-rate-limit multer nodemailer dotenv tsx`
- [x] Types : `@types/express @types/better-sqlite3 @types/jsonwebtoken @types/bcryptjs @types/multer`
- [x] Créer `backend/.env` (ne pas commiter)
- [x] Créer `start.sh` à la racine

### Config
- [x] `src/config/env.ts` — Zod schema variables d'environnement
- [x] `src/config/database.ts` — Connexion SQLite, auto-run migrations au démarrage

### Migrations
- [x] `src/migrations/001_initial.sql` — Tables : users, profile, projects, project_images, experiences, education, skills, translations, messages, page_views, settings
- [x] Seed via `database.ts` — Admin + 14 settings par défaut

### Middleware
- [x] `src/middleware/auth.ts` — Vérification JWT
- [x] `src/middleware/validate.ts` — Middleware Zod générique
- [x] `src/middleware/errorHandler.ts` — Réponses d'erreur JSON centralisées

### API Auth
- [x] `POST /api/auth/login`

### API Profile
- [x] `GET /api/profile`
- [x] `PUT /api/admin/profile`

### API Projects
- [x] `GET /api/projects`
- [x] `GET /api/projects/:id`
- [x] `POST /api/admin/projects`
- [x] `PUT /api/admin/projects/:id`
- [x] `DELETE /api/admin/projects/:id`
- [x] `POST /api/admin/projects/:id/images`
- [x] `DELETE /api/admin/projects/:id/images/:imageId`

### API Experience
- [x] `GET /api/experiences`
- [x] `POST /api/admin/experiences`
- [x] `PUT /api/admin/experiences/:id`
- [x] `DELETE /api/admin/experiences/:id`

### API Education
- [x] `GET /api/education`
- [x] `POST /api/admin/education`
- [x] `PUT /api/admin/education/:id`
- [x] `DELETE /api/admin/education/:id`

### API Skills
- [x] `GET /api/skills`
- [x] `POST /api/admin/skills`
- [x] `PUT /api/admin/skills/:id`
- [x] `DELETE /api/admin/skills/:id`

### API Translations
- [x] `GET /api/translations/:lang`
- [x] `PUT /api/admin/translations`

### API Settings
- [x] `GET /api/settings` (public)
- [x] `PUT /api/admin/settings`

### API Contact & Messages
- [x] `POST /api/contact` (Nodemailer)
- [x] `GET /api/admin/messages`
- [x] `PUT /api/admin/messages/:id/read`
- [x] `DELETE /api/admin/messages/:id`

### API Analytics
- [x] `POST /api/track` (public, rate-limited 1/s/IP)
- [x] `GET /api/admin/analytics` (stats agrégées 7/30 jours)

### API Upload
- [x] `POST /api/admin/upload` (Multer)

### Entrée
- [x] `src/index.ts` — Express app, middlewares globaux, montage des routes, SPA fallback en prod

---

## Phase 2 — Frontend Scaffolding

### Init
- [x] Structure Vite + Vue 3 dans `frontend/` (manuel)
- [x] Installer : `vue-router pinia vue-i18n`
- [x] `vite.config.ts` — proxy `/api` → `localhost:3000`
- [x] `index.html` — `<link>` Google Fonts (Inter, Fraunces, JetBrains Mono, Playfair Display, Space Grotesk)

### Design system `src/style.css`
- [x] Reset + base elements
- [x] Tokens globaux
- [x] 4 thèmes CSS complets
- [x] Composants transverses (btn, card, chip, etc.)
- [x] Animations fade-up, scale-in, pulse-dot
- [x] Tous les variants data-* (density, card, hero, type, accent, available)
- [x] Styles publics complets (nav, hero, about, skills, projects, modal, timeline, contact, footer)
- [x] Styles admin complets (sidebar, topbar, stat-cards, panel, chart, messages, settings, table, toast, login)

### Lib & Types
- [x] `src/lib/api.ts`
- [x] `src/lib/types.ts`
- [x] `src/lib/utils.ts`

### Router
- [x] `src/router/index.ts` — routes publiques + guard JWT admin

### Stores Pinia
- [x] `src/stores/auth.ts`
- [x] `src/stores/settings.ts` — fetchSettings, isSectionEnabled, applyToDOM, updateSettings
- [x] `src/stores/messages.ts`

### Layouts
- [x] `src/layouts/PublicLayout.vue` — Navbar + slot + init settings + IntersectionObserver
- [x] `src/layouts/AdminLayout.vue` — Sidebar + Topbar + slot

### i18n
- [x] `src/i18n/fr.json`
- [x] `src/i18n/en.json`
- [x] `src/i18n/index.ts` — setup vue-i18n, merge API translations

### Composants UI
- [x] `AppButton.vue`
- [x] `AppToggle.vue`
- [x] `AppModal.vue`
- [x] `AppToast.vue`

---

## Phase 3 — Portfolio Public

### Sections
- [x] `HeroSection.vue`
- [x] `AboutSection.vue`
- [x] `SkillsSection.vue` — IntersectionObserver skill bars
- [x] `ProjectsSection.vue` — filter tabs + modal
- [x] `ExperienceEducationSection.vue` — grid 2 col (1 si 1 seul activé)
- [x] `ContactSection.vue` — formulaire + POST /api/contact
- [x] `FooterSection.vue`

### Modale Projet
- [x] `ProjectModal.vue` — gallery + dots + Escape/X/overlay

### HomeView
- [x] `HomeView.vue` — assemblage conditionnel

### Analytics
- [x] `POST /api/track` dans HomeView au montage, debounce 500ms

---

## Phase 4 — Multilingue

- [x] Setup vue-i18n dans `main.ts`
- [x] Fetch `GET /api/translations/:lang` au changement de langue
- [x] Language switcher (navbar)
- [x] Sections utilisent `$t()`

---

## Phase 5 — Admin Backoffice

### Vues
- [x] `LoginView.vue`
- [x] `DashboardView.vue` — stat cards + SVG chart + derniers messages
- [x] `ProfileView.vue` — formulaire + upload avatar/CV + toggle available
- [x] `ProjectsView.vue` — table + AppModal CRUD
- [x] `ExperienceView.vue` — table + AppModal CRUD
- [x] `EducationView.vue` — table + AppModal CRUD
- [x] `SkillsView.vue` — table + AppModal CRUD + slider niveau
- [x] `TranslationsView.vue` — tableau FR/EN
- [x] `MessagesView.vue` — liste unread/read + expansion + actions
- [x] `SettingsView.vue` — theme picker + font + layout + sections + titre

---

## Phase 6 — Docker & Déploiement

- [x] `docker/Dockerfile` — multi-stage
- [x] `docker/docker-compose.yml`

---

## Vérification finale

- [ ] Lancer les deux serveurs et tester dans le navigateur
- [ ] Toggle section depuis admin → masquage immédiat côté public
- [ ] Changement thème → instantané, persisté
- [ ] Envoi message contact → visible dans admin
- [ ] Analytics → visites comptées
- [ ] Auth → login, logout, guard routes admin
- [ ] Skill bars → animées au scroll
- [ ] Modale projet → galerie, fermeture
- [ ] Docker → build complet
