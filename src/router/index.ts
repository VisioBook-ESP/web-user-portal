// src/router/index.ts
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import { useAuthStore } from "@/store/auth";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "home",
    component: () => import("@/views/Home.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/health",
    name: "health",
    component: () => import("@/views/Health.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/forgot-password",
    name: "forgot-password",
    component: () => import("@/views/auth/ForgotPasswordView.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/dashboard",
    name: "dashboard",
    component: () => import("@/views/DashboardView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/scanner",
    name: "scanner",
    component: () => import("@/views/ScannerView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/projects",
    name: "projects",
    component: () => import("@/views/ProjectsView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/projects/:id",
    name: "project-detail",
    component: () => import("@/views/ProjectDetailView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/projects/:id/player",
    name: "player",
    component: () => import("@/views/PlayerView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/projects/:id/edit",
    name: "edit-project",
    component: () => import("@/views/EditProjectView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/history",
    name: "history",
    component: () => import("@/views/HistoryView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/profile",
    name: "profile",
    component: () => import("@/views/ProfileView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/settings",
    name: "settings",
    component: () => import("@/views/SettingsView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/subscription",
    name: "subscription",
    component: () => import("@/views/SubscriptionView.vue"),
    meta: { requiresAuth: true },
  },
  // Admin routes
  {
    path: "/admin/projects",
    name: "admin-projects",
    component: () => import("@/views/AdminProjectsView.vue"),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin/projects/:id",
    name: "admin-project-detail",
    component: () => import("@/views/AdminProjectDetailView.vue"),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin/users",
    name: "admin-users",
    component: () => import("@/views/AdminUsersView.vue"),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin/users/:id",
    name: "admin-user-detail",
    component: () => import("@/views/AdminUserDetailView.vue"),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin/monitor",
    name: "admin-monitor",
    component: () => import("@/views/AdminMonitorView.vue"),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("@/views/NotFoundView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some((record) => record.meta.requiresAdmin);
  const redirectIfAuth = to.matched.some(
    (record) => record.meta.redirectIfAuth,
  );

  if (requiresAuth && !authStore.isAuthenticated) {
    // Redirect to home if route requires auth and user is not authenticated
    next({
      name: "home",
      query: { redirect: to.fullPath },
    });
  } else if (requiresAdmin && !authStore.isAdmin) {
    // Redirect to dashboard if route requires admin and user is not admin
    next({ name: "dashboard" });
  } else if (redirectIfAuth && authStore.isAuthenticated) {
    // Redirect to dashboard if user is already authenticated
    next({ name: "dashboard" });
  } else {
    next();
  }
});

export default router;
