import Vue from 'vue';
import Amplify from 'aws-amplify';
import '@aws-amplify/ui-vue';
import Buefy from 'buefy'
import 'buefy/dist/buefy.css'

import awsconfig from './aws-config';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import store from './store';

Amplify.configure(awsconfig);

Vue.use(Buefy)
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
