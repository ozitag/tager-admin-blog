import { i18n } from '@tager/admin-services';

import { EN } from './en';
import { RU } from './ru';

export function applyTranslations() {
  i18n.addTranslations('en', 'blog', EN);
  i18n.addTranslations('ru', 'blog', RU);
}
