import Vue, { CreateElement } from 'vue';
import VueCompositionApi, { createApp } from '@vue/composition-api';
import Vuex from 'vuex';

import { configStore, i18n } from '@tager/admin-services';
import { AdminUiPlugin } from '@tager/admin-ui';
import { AdminLayoutPlugin } from '@tager/admin-layout';

import '@tager/admin-ui/dist/admin-ui.css';

import config from '@/config/config.json';
import App from '@/views/App.vue';
import EN from '@/locales/en';
import RU from '@/locales/ru';
import router from '@/router';
import store from '@/store';

configStore.setConfig(config);

Vue.use(VueCompositionApi);

i18n.addTranslations('en', 'blog', EN);
i18n.addTranslations('ru', 'blog', RU);

i18n.init({ debug: false }).then(() => {
  const app = createApp({
    router,
    render: (h: CreateElement) => h(App),
    store,
  });

  app.use(i18n.getPlugin());
  app.use(Vuex);
  app.use(AdminUiPlugin);
  app.use(AdminLayoutPlugin);

  app.mount('#app');
});
