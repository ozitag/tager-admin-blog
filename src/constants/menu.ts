import { MenuItemType } from '@tager/admin-layout';
import { TranslateFunction } from '@tager/admin-services';
import {
  getBlogCategoryFormUrl,
  getBlogCategoryListUrl,
  getBlogPostFormUrl,
  getBlogPostListUrl,
} from './paths';

export function getBlogMenuItem(params: {
  t: TranslateFunction;
}): MenuItemType {
  return {
    id: 'blog',
    name: params.t('blog:blog'),
    path: '',
    icon: 'viewList',
    children: [
      {
        name: params.t('blog:createPost'),
        path: getBlogPostFormUrl({ postId: 'create' }),
      },
      { name: params.t('blog:posts'), path: getBlogPostListUrl() },
      {
        name: params.t('blog:createCategory'),
        path: getBlogCategoryFormUrl({ categoryId: 'create' }),
      },
      { name: params.t('blog:categories'), path: getBlogCategoryListUrl() },
    ],
  };
}
