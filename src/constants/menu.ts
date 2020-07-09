import { MenuItemType } from '@tager/admin-layout';

export const BLOG_MENU_ITEM: MenuItemType = {
  id: 'blog',
  name: 'Blog',
  path: '/blog/posts',
  icon: 'viewList',
  children: [
    { name: 'New Post', path: '/blog/posts/create' },
    { name: 'Posts', path: '/blog/posts' },
    { name: 'New Category', path: '/blog/categories/create' },
    { name: 'Categories', path: '/blog/categories' },
  ],
};
