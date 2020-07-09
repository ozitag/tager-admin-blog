import path from 'path';

import alias from '@rollup/plugin-alias';
import resolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import vue from 'rollup-plugin-vue';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.esm.js',
      format: 'es',
    },
    {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'TagerAdminLayout',
      // globals: {
      //   vue: 'Vue',
      //   'vue-router': 'VueRouter',
      //   '@tager/admin-services': 'adminServices',
      //   '@tager/admin-ui': 'adminUi',
      // },
    },
    // {
    //   file: 'dist/index.min.js',
    //   format: 'iife',
    //   name: 'TagerAdminLayout',
    //   // globals: {
    //   //   vue: 'Vue',
    //   //   'vue-router': 'VueRouter',
    //   //   '@tager/admin-services': 'adminServices',
    //   //   '@tager/admin-ui': 'adminUi',
    //   // },
    // },
  ],
  external: [
    'vue',
    '@tager/admin-services',
    '@tager/admin-ui',
    '@tager/admin-layout',
    '@babel/runtime',
  ],
  plugins: [
    typescript(),
    alias({
      entries: [
        {
          find: /^@\/(.*)$/,
          replacement: `${path.resolve(__dirname, 'src')}/$1`,
        },
      ],
    }),
    vue(),
    resolve({ extensions: ['.ts', '.js', '.css', '.svg', '.vue'] }),
    commonjs(),
    // svg({ svgoConfig: { plugins: [{ removeViewBox: false }] } }),
    babel({
      presets: ['@babel/preset-env'],
      plugins: ['@babel/plugin-transform-runtime'],
      babelHelpers: 'runtime',
    }),
  ],
};
