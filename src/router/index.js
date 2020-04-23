import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
  },
  {
    path: '/@:username',
    name: 'explorer',
    component: () => import(/* webpackChunkName: "explorer" */ '../views/Explorer.vue'),
  },
  {
    path: '/tx/:txid',
    name: 'transaction',
    component: () => import(/* webpackChunkName: "transaction" */ '../views/Transaction.vue'),
  },
  {
    path: '/b/:block',
    name: 'block',
    component: () => import(/* webpackChunkName: "block" */ '../views/Block.vue'),
  },
  {
    path: '/richlist/:symbol?',
    name: 'richlist',
    component: () => import(/* webpackChunkName: "richlist" */ '../views/Richlist.vue'),
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
