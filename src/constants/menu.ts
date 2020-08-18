import { MenuItemType } from '@tager/admin-layout';
import { TranslateFunction } from '@tager/admin-services';
import {
  getBlogCategoryFormUrl,
  getBlogCategoryListUrl,
  getBlogPostFormUrl,
  getBlogPostListUrl,
  getBlogSettingsUrl,
} from './paths';

export function getBlogMenuItem(params: {
  t: TranslateFunction;
}): MenuItemType {
  return {
    id: 'blog',
    text: params.t('blog:blog'),
    icon: 'viewList',
    children: [
      {
        text: params.t('blog:createPost'),
        url: getBlogPostFormUrl({ postId: 'create' }),
      },
      { text: params.t('blog:posts'), url: getBlogPostListUrl() },
      {
        text: params.t('blog:createCategory'),
        url: getBlogCategoryFormUrl({ categoryId: 'create' }),
      },
      { text: params.t('blog:categories'), url: getBlogCategoryListUrl() },
      { text: params.t('blog:settings'), url: getBlogSettingsUrl() },
    ],
  };
}
