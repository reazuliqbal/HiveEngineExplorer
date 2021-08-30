import Vue from 'vue';
import Loading from 'vue-loading-overlay';
import VueTimeago from 'vue-timeago';
import {
  ButtonPlugin, NavbarPlugin, FormInputPlugin,
  PaginationPlugin, TablePlugin, LayoutPlugin,
  FormPlugin, ModalPlugin,
} from 'bootstrap-vue';
import App from './App.vue';
import router from './router';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

import 'vue-loading-overlay/dist/vue-loading.css';
import './styles/app.scss';

Vue.use(ButtonPlugin);
Vue.use(NavbarPlugin);
Vue.use(FormInputPlugin);
Vue.use(PaginationPlugin);
Vue.use(TablePlugin);
Vue.use(LayoutPlugin);
Vue.use(FormPlugin);
Vue.use(ModalPlugin);
Vue.use(VueTimeago, {
  name: 'Timeago',
  locale: 'en',
});

Vue.use(Loading, {
  color: 'red',
});

Vue.config.productionTip = false;

new Vue({
  router,
  render: (h) => h(App),
}).$mount('#app');
