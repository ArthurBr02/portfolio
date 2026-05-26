# PROGRESS.md — Portfolio V3

> Consulter `IMPLEMENTATION_PLAN.md` pour le détail de chaque phase.  
> Consulter `./design/` pour les specs visuelles avant tout travail frontend.  
> Mettre à jour ce fichier à chaque tâche terminée.

---

## Phase 1 — Backend (Clean Architecture)

### Initialisation
- [ ] Créer `backend/` avec `package.json`, `tsconfig.json`
- [ ] Installer les dépendances : `express`, `better-sqlite3`, `zod`, `jsonwebtoken`, `bcryptjs`, `helmet`, `cors`, `express-rate-limit`, `multer`, `nodemailer`, `dotenv`, `tsx`
- [ ] Créer `backend/.env` (ne pas commiter)
- [ ] Script `start.sh` à la racine

### Config
- [ ] `src/config/env.ts` — Zod schema pour les variables d'environnement
- [ ] `src/config/database.ts` — Connexion SQLite, auto-run migrations au démarrage

### Migrations SQL
- [ ] `src/migrations/001_initial.sql` — Toutes les tables :
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
- [ ] `src/migrations/002_seed.sql` — Admin + settings par défaut

### Middleware
- [ ] `src/middleware/auth.ts` — Vérification JWT
- [ ] `src/middleware/validate.ts` — Middleware Zod générique (body/params/query)
- [ ] `src/middleware/errorHandler.ts` — Gestionnaire d'erreurs centralisé

### API — Auth
- [ ] `POST /api/auth/login`

### API — Profile
- [ ] `GET /api/profile`
- [ ] `PUT /api/admin/profile`

### API — Projects
- [ ] `GET /api/projects`
- [ ] `GET /api/projects/:id`
- [ ] `POST /api/admin/projects`
- [ ] `PUT /api/admin/projects/:id`
- [ ] `DELETE /api/admin/projects/:id`
- [ ] `POST /api/admin/projects/:id/images`
- [ ] `DELETE /api/admin/projects/:id/images/:imageId`

### API — Experience
- [ ] `GET /api/experiences`
- [ ] `POST /api/admin/experiences`
- [ ] `PUT /api/admin/experiences/:id`
- [ ] `DELETE /api/admin/experiences/:id`

### API — Education
- [ ] `GET /api/education`
- [ ] `POST /api/admin/education`
- [ ] `PUT /api/admin/education/:id`
- [ ] `DELETE /api/admin/education/:id`

### API — Skills
- [ ] `GET /api/skills`
- [ ] `POST /api/admin/skills`
- [ ] `PUT /api/admin/skills/:id`
- [ ] `DELETE /api/admin/skills/:id`

### API — Translations
- [ ] `GET /api/translations/:lang`
- [ ] `PUT /api/admin/translations`

### API — Settings
- [ ] `GET /api/settings` (public)
- [ ] `PUT /api/admin/settings`

### API — Contact & Messages
- [ ] `POST /api/contact` (envoi email via Nodemailer)
- [ ] `GET /api/admin/messages`
- [ ] `PUT /api/admin/messages/:id/read`
- [ ] `DELETE /api/admin/messages/:id`

### API — Analytics
- [ ] `POST /api/track` (public, rate-limited)
- [ ] `GET /api/admin/analytics`

### API — Upload
- [ ] `POST /api/admin/upload` (Multer)

### Entrée principale
- [ ] `src/index.ts` — App Express, middlewares globaux, montage des routes

---

## Phase 2 — Frontend Scaffolding

### Initialisation
- [ ] Scaffolding Vite + Vue 3 dans `frontend/`
- [ ] Installer : `vue-router`, `pinia`, `vue-i18n`
- [ ] Configurer `vite.config.ts` (proxy `/api` → `localhost:3000`)

### Design system
- [ ] `src/style.css` — Reset, design tokens, 4 thèmes CSS, animations globales
  - [ ] Thème `sable` (défaut)
  - [ ] Thème `foret`
  - [ ] Thème `crepuscule`
  - [ ] Thème `minuit`
  - [ ] `@keyframes fade-up`, `scale-in`
  - [ ] Classes `.animate-on-scroll`, `.animate-scale-on-scroll`
  - [ ] `prefers-reduced-motion` fallback

### Lib & Types
- [ ] `src/lib/api.ts` — Client fetch centralisé (base URL, JWT header auto)
- [ ] `src/lib/types.ts` — Types TypeScript partagés
- [ ] `src/lib/utils.ts` — Helpers divers

### Router
- [ ] `src/router/index.ts` — Routes publiques + admin guard JWT
  - [ ] `/` → HomeView
  - [ ] `/login` → LoginView
  - [ ] `/admin` → redirect `/admin/dashboard`
  - [ ] `/admin/dashboard`
  - [ ] `/admin/profile`
  - [ ] `/admin/projects`
  - [ ] `/admin/experience`
  - [ ] `/admin/education`
  - [ ] `/admin/skills`
  - [ ] `/admin/translations`
  - [ ] `/admin/messages`
  - [ ] `/admin/settings`

### Stores Pinia
- [ ] `src/stores/auth.ts` — JWT login/logout, persistance localStorage
- [ ] `src/stores/settings.ts` — Fetch `/api/settings`, `isSectionEnabled()`, `currentTheme`, `setTheme()`
- [ ] `src/stores/messages.ts` — `unreadCount` pour le badge sidebar

### Layouts
- [ ] `src/layouts/PublicLayout.vue` — Navbar + slot
- [ ] `src/layouts/AdminLayout.vue` — Sidebar + topbar + slot

### i18n
- [ ] `src/i18n/fr.json` — Traductions statiques FR
- [ ] `src/i18n/en.json` — Traductions statiques EN
- [ ] `src/i18n/index.ts` — Setup vue-i18n, merge avec traductions API

### Composants UI réutilisables
- [ ] `AppButton.vue`
- [ ] `AppToggle.vue`
- [ ] `AppCard.vue`
- [ ] `AppModal.vue`
- [ ] `AppToast.vue`
- [ ] `AppBadge.vue`

---

## Phase 3 — Portfolio Public

### Navbar publique
- [ ] Sticky, liens d'ancres dynamiques (sections activées uniquement)
- [ ] Badge "Disponible" (pastille verte pulsante si `available_for_work`)
- [ ] Language switcher FR/EN
- [ ] Indicateur de section active (IntersectionObserver)

### Sections
- [ ] `HeroSection.vue` — Full-viewport, text reveal CSS, gradient mesh, CTA
- [ ] `AboutSection.vue` — Split layout photo + bio, parallax CSS
- [ ] `SkillsSection.vue` — Category cards, skill bars animées au scroll
- [ ] `ProjectsSection.vue` — Grid + filter tabs + clic → modale détail
- [ ] `ExperienceSection.vue` — Timeline verticale scroll-reveal
- [ ] `EducationSection.vue` — Timeline compacte, même style
- [ ] `ContactSection.vue` — Formulaire + validation client + `POST /api/contact`

### Modale Projet
- [ ] Galerie d'images navigable (carrousel)
- [ ] Description longue, technologies, liens demo/repo
- [ ] Fermeture : overlay, Escape, bouton X
- [ ] Animation entrée/sortie CSS

### HomeView
- [ ] `src/views/public/HomeView.vue` — Assemblage conditionnel des sections (`v-if`)

### Analytics
- [ ] `POST /api/track` au changement de route (debounced)

---

## Phase 4 — Multilingue

- [ ] Setup vue-i18n dans `main.ts`
- [ ] Fetch `GET /api/translations/:lang` et merge par-dessus les JSON statiques
- [ ] Language switcher (store Pinia, persisté localStorage)
- [ ] Toutes les sections publiques utilisent `$t()`

---

## Phase 5 — Admin Backoffice

### Vues admin
- [ ] `LoginView.vue`
- [ ] `DashboardView.vue` — Stats cards + graphique visites SVG/Canvas + derniers messages
- [ ] `ProfileView.vue` — Formulaire profil + upload avatar/CV
- [ ] `ProjectsView.vue` — Table + modal create/edit + gestion images multiples
- [ ] `ExperienceView.vue` — Table + modal create/edit
- [ ] `EducationView.vue` — Table + modal create/edit
- [ ] `SkillsView.vue` — Table + modal create/edit
- [ ] `TranslationsView.vue` — Tableau éditable clé/valeur par langue
- [ ] `MessagesView.vue` — Liste lu/non-lu + actions (marquer lu, supprimer)
- [ ] `SettingsView.vue` — Sélecteur de thème (4 cards preview) + toggles sections + titre du site

### Composants admin
- [ ] Sidebar avec badge unreadCount sur "Messages"
- [ ] Topbar avec nom utilisateur + logout
- [ ] Toast notifications globales

---

## Phase 6 — Docker & Déploiement

- [ ] `docker/Dockerfile` — Multi-stage (build frontend → runtime backend)
- [ ] `docker/docker-compose.yml` — Volumes pour SQLite + uploads
- [ ] Express sert le frontend buildé (`./public`) en production
- [ ] Tester le build Docker complet

---

## Vérification finale

- [ ] Flux complet : toggle section depuis admin → vérifier masquage côté public
- [ ] Changement de thème : instantané, persisté en base
- [ ] Envoi de message contact → email reçu + message visible dans admin
- [ ] Analytics : visites comptées + graphique dashboard
- [ ] Multilingue : switch FR/EN, traductions admin éditables
- [ ] Auth : login, logout, guard routes admin
- [ ] Docker : `docker-compose up` → portfolio accessible sur port 3000
