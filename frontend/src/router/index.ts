import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: (to) => {
        const authStore = useAuthStore();
        return authStore.user ? '/tasks' : '/login';
      }
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../components/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('../components/Register.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/tasks',
      name: 'Tasks',
      component: () => import('../components/TaskList.vue'),
      meta: { requiresAuth: true }
    }
  ]
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isAuthRoute = to.path === '/login' || to.path === '/register';

  if (requiresAuth && !authStore.user) {
    // Redirect to login if trying to access protected route without auth
    next('/login');
  } else if (isAuthRoute && authStore.user) {
    // Redirect to tasks if trying to access auth routes while logged in
    next('/tasks');
  } else {
    next();
  }
});

export default router; 