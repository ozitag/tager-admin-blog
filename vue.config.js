const util = require('util');

module.exports = {
  pages: {
    index: {
      entry: 'src/dev.ts',
    },
  },
  publicPath: process.env.VUE_APP_PUBLIC_PATH || '/',
  chainWebpack: (config) => {
    const svgRule = config.module.rule('svg');

    svgRule.uses.clear();

    svgRule
      .use('babel-loader')
      .loader('babel-loader')
      .end()
      .use('vue-svg-loader')
      .loader('vue-svg-loader')
      .options({ svgo: { plugins: [{ removeViewBox: false }] } });
    },
};
