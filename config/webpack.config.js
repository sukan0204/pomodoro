'use strict';

const { merge } = require('webpack-merge');

const common = require('./webpack.common.js');
const PATHS = require('./paths');

// Merge webpack configuration files
const config = (env, argv) =>
  merge(common, {
    entry: {
      app: PATHS.src + '/app.js',
      background: PATHS.src + '/background.js',
      popup: PATHS.src + '/popup.js',
    },
    devtool: argv.mode === 'production' ? false : 'source-map',
  });

module.exports = config;
