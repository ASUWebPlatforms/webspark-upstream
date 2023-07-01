// Create a duplicate of this file and rename it to config.local.js
// Use this file to store any config unique to your local development setup
const mix = require('laravel-mix');

module.exports = {
  proxy: 'https://my-local-dev.site'
};

mix.webpackConfig({
  devtool: 'source-map'
})

mix.sourceMaps(false,'eval-source-map');
