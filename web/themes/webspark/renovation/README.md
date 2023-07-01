# Renovation Theme
Theme for Webspark 2: Implements Web Standards 2.0

Contents
- [Renovation Theme](#renovation-theme)
  - [General Information](#general-information)
- [](#)
  - [Developer Information](#developer-information)
    - [Set up local development](#set-up-local-development)
    - [Reconciling Unity with Renovation](#reconciling-unity-with-renovation)
    - [How to compile Sass files for release](#how-to-compile-sass-files-for-release)
  - [Caveats](#caveats)

## General Information
This theme is bundled with ASU's Drupal 9+ custom profile, Webspark 2. When spinning up a new site, if you select the ASU Webspark installation profile, this theme will be automatically installed and selected as the default theme.

The Renovation theme is a subtheme of the Radix theme. Radix will need to remain enabled in order for Renovation to work properly. You can further customize your site by creating a subtheme of Renovation, but this is only to be done with extreme caution. Subthemed sites will not be supported officially by the University Technology Office, due to the difficulty of troubleshooting issues that may arise. So, please make sure you have adequate developer resources at your disposal in order to create and maintain your subtheme.

The Renovation theme utilizes [Sass](https://sass-lang.com/) for the creation and maintenance of site styles. This enables us to use variables, mix-ins, and other tools to make the theme development experience more efficient and enjoyable. Renovation's Sass  code relies on [Webpack](https://webpack.js.org) to compile it into standard CSS and JavaScript.

The Renovation theme is an extension and outgrowth of the platform-agnostic Unity Design System's (UDS) customized [bootstrap4-theme](https://github.com/ASU/asu-unity-stack/tree/dev/packages/bootstrap4-theme). The Unity bootstrap4-theme has been modified slightly in Renovation to accommodate the [Twig](https://twig.symfony.com/) templating engine, and contains other Drupal-specific modifications while staying true to the standards established in UDS.

#

## Developer Information
Due to the fact that this theme is somewhat different from the source content in UDS, included below are instructions for Renovation's theme maintainers on how to reconcile those differences, especially when preparing for Webspark 2 releases.

### Set up local development
1. Clone repository from Github to your local development environment (https://github.com/ASUWebPlatforms/webspark-theme-renovation). If you are unable to access the repository, contact the Web Platforms Development team for assistance.
2. Create a new branch locally (ideally named in reference to a Jira ticket, such as WS2-NNN) with `git checkout -b branchname`.
3. Push your new branch up to the Github repository and set up remote tracking: `git push -u origin branchname`

### Reconciling Unity with Renovation
1. Determine which files have changed since the last Webspark2 release.
   - Use the [check-element-changes](https://github.com/ASU/asu-unity-stack#check-element-changes) tool in UDS to determine which files need attention. This tool will alert you to which bootstrap4-theme design components have had changes in their code since a date you specify. It also instructs you to run a git command to see ALL of the files that have changed since the selected date.
2. Update to the version of the `bootstrap4-theme` package from Unity you want to use for this release. [See the bootstrap4-theme package registry](https://github.com/ASU/asu-unity-stack/pkgs/npm/bootstrap4-theme). Please use Yarn for package management to ensure consistency. E.g. `yarn upgrade @asu/bootstrap4-theme@1.10.3`
This step updates the `bootstrap4-theme` package in your `node_modules` folder. Note: we commit the `bootstrap4-theme` package's folder in order to ensure we have all the assets needed by the theme, and to ensure we are not copying duplicate assets into the theme. Please leave the package's files where they are and reference them as needed.
3. The package will provide the scss files and other assets you need but does not include template stories files. To update the templates based on your findings from step 1., refer to the package version number which will correspond to a GitHub tag. Browse to the templates in GitHub using that tag. An easy way to do this is to [browse to the release](https://github.com/ASU/asu-unity-stack/releases) and click the tag link for the package release.
4. Templates that exist as stories in Unity will be found at a path such as:
`asu-unity-stack/packages/bootstrap4-theme/stories/**/*.templates.stories.js`
and their Webspark 2 Twig template counterpart can be found at:
`webspark-theme-renovation/src/components/**/*.twig`
You can roughly connect the stories in the `*.templates.stories.js` file with the `*.twig` file for the component in Renovation. Make note of any changes in the `*.templates.stories.js` file and adjust the Renovation `*.twig` file accordingly.
5. There may be JS files that have gotten updated too, and the process of bringing those updates into WS2 will vary, but the JS file will usually be in the same folder as the Twig template. The non-story `*.js` file in UDS will sometimes match the `*.js` file in Renovation, but sometimes changes have been made to accommodate the Drupal way of doing things. The most common of these differences will often be related to Drupal behaviors. See the [JavaScript API documentation](https://www.drupal.org/docs/drupal-apis/javascript-api/javascript-api-overview) for more information. Because of the potential for differences, please **DO NOT** simply copy/paste this file from UDS to Renovation. Instead, open the file in both repositories and compare what you see in UDS with what you find in Renovation. If there are changes, manually add those changes to the Renovation file. The code from UDS may need to be wrapped in a Drupal behavior in order to make it work.
6. To update and compile the **Sass/CSS** from the `bootstrap4-theme` along with our Renovation customizations for use in the theme, there are several files implemented in Renovation that aggregate and import many of the scss files. Specific instructions about them are as follows:
   - Renovation theme's `src/sass/bootstrap-asu-extends.scss`: You will notice that this file is significantly different in Renovation from what you see in the package's own `node_modules/@asu/bootstrap4-theme/src/scss/bootstrap-asu-extends.scss`. This is because the paths to the styles are necessarily different, due to the fact that the `bootstrap4-theme` design components are being added differently in Drupal than in Unity. Please note the `../components/` paths for templates from our theme on some imports, whereas others reference the the `extends/` folder from the package in `node_modules`. **DO NOT** copy/paste updates from the `bootstrap4-package` extends file directly into the Renovation version, but rather go through it line-by-line to ensure all styles are imported and updated appropriately.
   - Renovation theme's `src/sass/bootstrap-asu.scss`: Similarly, this file imports many styles from the `bootstrap4-theme` package into the Renovation theme. Please note that the `$image-assets-path` is different in Renovation than UDS.
   - Renovation theme's `src/sass/bootstrap-asu-upgrade.scss`: This file reconciles the fact that UDS and Renovation are currently on different versions of Bootstrap. It fills the gaps to bring the two into alignment in Renovation.

**PLEASE NOTE:** When updating `bootstrap4-theme` design components or Sass files it is a best practice to not push the compiled Sass and JS assets until all pull requests have been merged and the final release is being prepared. This helps to avoid regressions and conflicts.

### How to compile Sass files for release
1. Go to the root of Renovation theme and run the following commands: `yarn install`.
2. Create a duplicate of `config.js` and rename it to `config.local.js`. Update the `proxy` key with the URL of your local development server.
3. Run the following command to compile Sass and watch for changes: `yarn watch`.
4. Make changes as described in "Reconciling Unity with Renovation."
5. When you have finished making your changes, compile the assets for production by running `yarn production`. **Important!** Do not add the compiled assets (found in `assets/css` and `assets/js`) to your git commit at this point.
6. Add all other changed files with `git add path/file`.
7. Commit changes in git and push to the remote repository.
8. Create a pull request against the `main` branch.
9. Verify that **ALL** pending pull requests for the release have been merged.
10. Pull all the latest changes into your branch from the main branch with `git pull origin main`.
11. Fix any conficts, if necessary, and commit your changes.
12. When the release is ready, the final step is to compile the CSS for production before your last commit. Do this by running `yarn production` again. This time, make sure that you add the changed files in the `assets` directory with `git add` and then commit the changes. If you get the following error while compiling the scss `Module build failed (from ./node_modules/postcss-loader/src/index.js): JisonLexerError: Lexical error on line 1: Unrecognized text./ [...and then a reference to some scss variables here...]` find the offending variables in the `node_modules` code. These variables are probably used inside of a `calc()` function. To resolve for the Renovation compilation script, wrap the variables in `#{}`. For example `max-height: calc($uds-card-height - $uds-size-spacing-8);` should become `max-height: calc(#{$uds-card-height} - #{$uds-size-spacing-8});` (Note: this may be able to be resolved with changes on the UDS side, but because at the time of this writing we are embarking on updating to Bootstrap 5, these may change, and the issue can be revisited if it still is an issue after the update.) 
13. Push the commit to the remote repository.
14. When your pull request has been approved, merge it into the main branch.
15. Create a new tag for the release (using semantic versioning principles), and update the composer.json file in `webspark-release-testing/upstream-configuration/` with that tag for `"asuwebplatforms/webspark-theme-renovation"`.
16. Increment the version number at the bottom of the composer.json file.
17. That's it! Submit the release for testing and do a happy dance (until you get bug reports back).

## Caveats
- Some of the classes from the core layout builder had to be changed. Because the core ones override everything we write here, we had to disable them from .info file and recreate them in the /css folder.
- The versions for libraries being used in this theme are **pinned**. You will be able to find the version numbers in package.json.
- Working on the theme can be made easier by utilizing the `watch` feature provided by webpack (as mentioned in Step 2 of "How to compile Sass files for release"). For more information on developing with the Radix theme using webpack, check out this excellent [tutorial](https://www.youtube.com/watch?v=ak1IOcYnN9s).
