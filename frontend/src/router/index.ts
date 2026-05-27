import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: (to) => {
    if (to.hash) return { el: to.hash, behavior: 'smooth' };
    return { top: 0 };
  },
  routes: [
    {
      path: '/',
      component: () => import('../layouts/PublicLayout.vue'),
      children: [
        { path: '', name: 'home', component: () => import('../views/public/HomeView.vue') },
      ],
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/admin/LoginView.vue'),
    },
    {
      path: '/admin',
      component: () => import('../layouts/AdminLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: '/admin/dashboard' },
        { path: 'dashboard',    name: 'dashboard',    component: () => import('../views/admin/DashboardView.vue') },
        { path: 'profile',      name: 'profile',      component: () => import('../views/admin/ProfileView.vue') },
        { path: 'projects',     name: 'projects',     component: () => import('../views/admin/ProjectsView.vue') },
        { path: 'experience',   name: 'experience',   component: () => import('../views/admin/ExperienceView.vue') },
        { path: 'education',    name: 'education',    component: () => import('../views/admin/EducationView.vue') },
        { path: 'skills',       name: 'skills',       component: () => import('../views/admin/SkillsView.vue') },
        { path: 'messages',     name: 'messages',     component: () => import('../views/admin/MessagesView.vue') },
        { path: 'translations', name: 'translations', component: () => import('../views/admin/TranslationsView.vue') },
        { path: 'settings',     name: 'settings',     component: () => import('../views/admin/SettingsView.vue') },
      ],
    },
  ],
});

router.beforeEach((to) => {
  if (to.meta.requiresAuth) {
    const auth = useAuthStore();
    if (!auth.isAuthenticated) return '/login';
  }
});

export default router;
