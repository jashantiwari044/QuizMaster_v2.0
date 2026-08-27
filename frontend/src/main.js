import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { fas } from '@fortawesome/free-solid-svg-icons'

// Import Global Styles
import './assets/main.css';

// Import Bootstrap JS and CSS (keeping for layout utilities, though we heavily customize)
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

library.add(fas);

const app = createApp(App);

app.use(router)
   .use(store)
   .component('font-awesome-icon', FontAwesomeIcon)
   .mount('#app');
