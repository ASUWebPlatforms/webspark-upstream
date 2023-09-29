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

The Renovation theme is an extension and outgrowth of the platform-agnostic Unity Design System's (UDS) customized [unity-bootstrap-theme](https://github.com/ASU/asu-unity-stack/tree/dev/packages/unity-bootstrap-theme). The `unity-bootstrap-theme` has been augmented and overridden slightly in Renovation to accommodate the [Twig](https://twig.symfony.com/) templating engine, and contains other Drupal-specific modifications while staying true to the standards established in UDS.

#

## Developer Information
Due to the fact that this theme is somewhat different from the source content in UDS, included below are instructions for Renovation's theme maintainers on how to reconcile those differences, especially when preparing for Webspark 2 releases.

### Set up local development
1. Clone the `webspark-ci` repository from Github to your local development environment (https://github.com/ASUWebPlatforms/webspark-ci). If you are unable to access the repository, contact the Web Platforms Development team for assistance.
2. Create a new branch locally (ideally named in reference to a Jira ticket, such as WS2-NNN) with `git checkout -b branchname`.
3. Push your new branch up to the Github repository and set up remote tracking: `git push -u origin branchname`

### Reconciling Unity with Renovation
Before the steps below, you first must have installed the `unity-bootstrap-theme` package locally. This can be done by running `yarn install`. For more details, see the "How to compile Sass files for release" section.

1. Determine which files have changed since the last Webspark2 release.
   - Use the [check-element-changes](https://github.com/ASU/asu-unity-stack#check-element-changes) tool in UDS to determine which files need attention. This tool will alert you to which `unity-bootstrap-theme` design components have had changes in their code since a date you specify. It also instructs you to run a git command to see ALL of the files that have changed since the selected date.
2. Update to the version of the `unity-bootstrap-theme` package from Unity you want to use for this release. [See the unity-bootstrap-theme package registry](https://github.com/ASU/asu-unity-stack/pkgs/npm/unity-bootstrap-theme). Please use Yarn for package management to ensure consistency. E.g. `yarn upgrade @asu/unity-bootstrap-theme@1.10.3`
This step updates the `unity-bootstrap-theme` package in your `node_modules` folder. Note: we do NOT commit the `node_modules` folder to in order to ensure we have all the assets needed by the theme, and to ensure we are not copying duplicate assets into the theme. Please leave the package's files where they are. For assets such as images, they can be moved to the appropriate `assets/` folder and registered in the `assets/mix-manifest.json`.
3. The package provides the scss files and other assets the guild needs but does not include template stories files. To update templates based on your findings from step 1., refer to the package version number which will correspond to a GitHub tag. Browse to the templates in GitHub using that tag. An easy way to do this is to [browse to the release](https://github.com/ASU/asu-unity-stack/releases) and click the tag link for the package release.
4. Templates that exist as stories in Unity will be found at a path such as:
`asu-unity-stack/packages/unity-bootstrap-theme/stories/**/*.templates.stories.js`
and their Webspark 2 Twig template counterpart can be found at:
`renovation/src/components/**/*.twig`
You can roughly connect the stories in the `*.templates.stories.js` file with the `*.twig` file for the component in Renovation. Make note of any changes in the `*.templates.stories.js` file and adjust the Renovation `*.twig` file accordingly.
5. There may be JS script files that have gotten updated too, and the process of bringing those updates into WS2 will vary, but the JS file will usually be in the same folder as the Twig template. The non-story `*.js` file in UDS will sometimes match the `*.js` file in Renovation, but sometimes changes have been made to accommodate the Drupal way of doing things. The most common of these differences will often be related to Drupal behaviors. See the [JavaScript API documentation](https://www.drupal.org/docs/drupal-apis/javascript-api/javascript-api-overview) for more information. Because of the potential for differences, please **DO NOT** simply copy/paste this file from UDS to Renovation. Instead, open the file in both repositories and compare what you see in UDS with what you find in Renovation. If there are changes, manually add those changes to the Renovation file. The code from UDS may need to be wrapped in a Drupal behavior in order to make it work.
6. To register new SCSS files, refer to `src/sass/renovation.style.scss` and work back through the imports to identify the `_index.scss` file to which to add your new scss file. Note that the `renovation.style.scss` is also where the `unity-bootstrap-theme` assets are imported.

**PLEASE NOTE:** When updating `unity-bootstrap-theme` design components or Sass files it is common for the compiled Sass and JS assets in a PR to get in conflict when other PRs affecting the combiled files merges before them. When that happens, merge the latest from the target branch of your PR and recompile and commit the updates.

### How to compile Sass files for release
1. Go to the root of Renovation theme and run the following commands: `yarn install`.
2. Create a duplicate of `config.js` and rename it to `config.local.js`. Update the `proxy` key with the URL of your local development server.
3. Run the following command to compile Sass and watch for changes: `yarn watch`.
4. Make changes as described in "Reconciling Unity with Renovation."
5. When you have finished making your changes, compile the assets for production by running `yarn production`.
6. Add changed files with `git add path/file`.
7. Pull all the latest changes into your branch from the branch you intend to merge into with `git pull origin <target-branch-name-here>`.
8. Fix any conficts, if necessary, and commit your changes.
9. Push the commit to the remote repository.
10. When your pull request has been approved, merge it into the sprint branch.

## Caveats
- Some of the classes from the core layout builder had to be changed. Because the core ones override everything we write here, we had to disable them from .info file and recreate them in the /css folder.
- The versions for libraries being used in this theme are **pinned**. You will be able to find the version numbers in package.json.
- Working on the theme can be made easier by utilizing the `watch` feature provided by webpack (as mentioned in Step 3 of "How to compile Sass files for release"). For more information on developing with the Radix theme using Webpack, check out this excellent [tutorial](https://www.youtube.com/watch?v=ak1IOcYnN9s).
