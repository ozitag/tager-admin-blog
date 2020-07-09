import Vue from 'vue';
import { configStore, i18n } from '@tager/admin-services';
import { AdminUiPlugin } from '@tager/admin-ui';
import '@tager/admin-ui/dist/admin-ui.css';

import { createRouter } from './router';
import { AdminLayoutPlugin } from './plugin';
import RU from './i18n/locales/ru';
import EN from './i18n/locales/en';

const TEST_CONFIG = {
  APP_NAME: 'OZiTAG_ADMIN',
  TITLE_TEMPLATE: 'OZiTAG Admin - {{title}}',
  LANGUAGE: 'EN',
  BRAND: {
    small: {
      logo: 'logo-small.svg',
      label: 'OZi',
      'label-color': '#DD6900',
    },
    large: {
      logo: 'logo.svg',
      label: 'OZiTAG',
      'label-color': '#DD6900',
    },
  },
  SPLASH_SCREEN: {
    enabled: true,
    logo: 'logo.svg',
    background: '#1e1e1e',
  },
};

configStore.setConfig(TEST_CONFIG);

const router = createRouter({}, { useTitleSync: false });

const sidebarMenuList = [
  {
    id: 'catalog',
    name: 'Catalog',
    path: '',
    icon: 'viewList',
    children: [
      {
        path: '/presets',
        name: 'All presets',
      },
      {
        path: '/presets/create',
        name: 'Create presets',
      },
    ],
  },

  {
    id: 'orders',
    name: 'Orders',
    path: '/orders',
    icon: 'assignment',
  },
  {
    id: 'settings',
    name: 'Settings',
    path: '',
    icon: 'settings',
    children: [
      {
        path: '/settings/common',
        name: 'Common',
      },
      {
        path: '/settings/seo',
        name: 'SEO',
      },
    ],
  },
];

Vue.use(AdminUiPlugin);
Vue.use(AdminLayoutPlugin);

i18n.addTranslations('ru', 'layout', RU);
i18n.addTranslations('en', 'layout', EN);

i18n.init({ debug: true, lng: 'ru' }).then(() => {
  Vue.use(i18n.getPlugin());

  new Vue({
    router,
    data() {
      return {
        sidebarMenuList,
        headerButtons: [
          { variant: 'secondary', text: 'say cow2', onClick: this.sayCow },
          {
            variant: 'secondary',
            text: 'Create entity link',
            href: 'http://ozitag.com',
          },
        ],
        displayRouterView: true,
      };
    },
    methods: {
      sayCow() {
        alert('Cooow');
      },
      saySubmit() {
        alert('submiiiit');
      },
    },
    template: `
      <page-layout v-bind:sidebar-menu-list="sidebarMenuList" >
          <router-view v-if="displayRouterView"/>
          <page v-else title="Page Title" :header-buttons="headerButtons"
                :is-content-loading="false"
                :footer="{ backHref: '/home', backLabel: 'Back to presets', submitLabel: 'Submit form', onSubmit: saySubmit, isSubmitting: false }">
              <template v-slot:content>
                  <div style="max-width: 400px;">
                      What is Lorem Ipsum? Lorem Ipsum is simply dummy text of the
                      printing and typesetting industry. Lorem Ipsum has been the
                      industry's standard dummy text ever since the 1500s, when an unknown
                      printer took a galley of type and scrambled it to make a type
                      specimen book. It has survived not only five centuries, but also the
                      leap into electronic typesetting, remaining essentially unchanged.
                      It was popularised in the 1960s with the release of Letraset sheets
                      containing Lorem Ipsum passages, and more recently with desktop
                      publishing software like Aldus PageMaker including versions of Lorem
                      Ipsum. Why do we use it? It is a long established fact that a reader
                      will be distracted by the readable content of a page when looking at
                      its layout. The point of using Lorem Ipsum is that it has a
                      more-or-less normal distribution of letters, as opposed to using
                      'Content here, content here', making it look like readable English.
                      Many desktop publishing packages and web page editors now use Lorem
                      Ipsum as their default model text, and a search for 'lorem ipsum'
                      will uncover many web sites still in their infancy. Various versions
                      have evolved over the years, sometimes by accident, sometimes on
                      purpose (injected humour and the like). Where does it come from?
                      Contrary to popular belief, Lorem Ipsum is not simply random text.
                      It has roots in a piece of classical Latin literature from 45 BC,
                      making it over 2000 years old. Richard McClintock, a Latin professor
                      at Hampden-Sydney College in Virginia, looked up one of the more
                      obscure Latin words, consectetur, from a Lorem Ipsum passage, and
                      going through the cites of the word in classical literature,
                      discovered the undoubtable source. Lorem Ipsum comes from sections
                      1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes
                      of Good and Evil) by Cicero, written in 45 BC. This book is a
                      treatise on the theory of ethics, very popular during the
                      Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit
                      amet..", comes from a line in section 1.10.32. The standard chunk of
                      Lorem Ipsum used since the 1500s is reproduced below for those
                      interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et
                      Malorum" by Cicero are also reproduced in their exact original form,
                      accompanied by English versions from the 1914 translation by H.
                      Rackham. Where can I get some? There are many variations of passages
                      of Lorem Ipsum available, but the majority have suffered alteration
                      in some form, by injected humour, or randomised words which don't
                      look even slightly believable. If you are going to use a passage of
                      Lorem Ipsum, you need to be sure there isn't anything embarrassing
                      hidden in the middle of text. All the Lorem Ipsum generators on the
                      Internet tend to repeat predefined chunks as necessary, making this
                      the first true generator on the Internet. It uses a dictionary of
                      over 200 Latin words, combined with a handful of model sentence
                      structures, to generate Lorem Ipsum which looks reasonable. The
                      generated Lorem Ipsum is therefore always free from repetition,
                      injected humour, or non-characteristic words etc.
                  </div>
              </template>
              <!--            <template slot="footer">-->
              <!--                <h2>Footer</h2>-->
              <!--                <base-button></base-button>-->
              <!--            </template>-->
          </page>
      </page-layout>
  `,
  }).$mount('#app');
});
