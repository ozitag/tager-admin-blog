import { i18n } from '@tager/admin-services';

import RU from './i18n/locales/ru';
import EN from './i18n/locales/en';

i18n.addTranslations('ru', 'layout', RU);
i18n.addTranslations('en', 'layout', EN);

export { default as PageLayout } from './components/PageLayout';
export { default as Page } from './components/Page';
export { default as NotFoundView } from './views/NotFound.vue';
export { createRouter } from './router';
export { AdminLayoutPlugin } from './plugin';
