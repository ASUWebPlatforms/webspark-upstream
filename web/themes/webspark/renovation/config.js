// Create a duplicate of this file and rename it to config.local.js
// Use this file to store any config unique to your local development setup
const mix = require("laravel-mix");

module.exports = {
  browserSync: {
    proxy: "https://my-local-dev.site",
    files: [
      "assets/js/**/*.js",
      "assets/css/**/*.css",
      "templates/**/*.twig",
      "src/**/*.twig",
    ],
    stream: true,
  },
};

mix
  .disableNotifications()
  .sourceMaps(false, "eval-source-map")
  .webpackConfig({
    devtool: "source-map",
  })
  .options({
    processCssUrls: false,
  });
