import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
  },
  {
    path: '/@:username',
    name: 'explorer',
    component: () => import('../views/Explorer.vue'),
  },
  {
    path: '/tx/:txid',
    name: 'transaction',
    component: () => import('../views/Transaction.vue'),
  },
  {
    path: '/b/:block',
    name: 'block',
    component: () => import('../views/Block.vue'),
  },
  {
    path: '/richlist/:symbol?',
    name: 'richlist',
    component: () => import('../views/Richlist.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
