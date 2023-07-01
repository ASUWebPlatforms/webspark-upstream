
# Webspark profile

## Description

Webspark profile installs all the required modules and configurations for the 
webspark distribution.

## How to install

1. Copy into the profiles folder.
2. Run "composer install"
3. Access the site url
4. In the install step "Select an installation profile" select the "Webspark" 
option

## Features

- Adds 2 new forms in the install: Google Analytics settings and Header settings
- Installs all the required modules for this distribution
- Comes with updates that will periodically improve the experience
- Has some predefined configurations on blocks, users, ckeditor profiles, 
system settings

## Updates

- Please check for existing updates after new releases. 
Url: \[site-url\]/update.php (with administrator rights)
or 
"drush updb" in the console 

## Composer 

The versions of contrib modules are pinned so we dont encounter any "surprise"
when we update the composer.

If we are required to update the versions of modules please re-test for
regressions.

If we need to update modules that have libraries, also please check their
versions. 

### Special cases
For example webforms module come with a lot of libraries. We had to create a
libraries file in order to download them and not use the CDN version. If you
update the webform module: https://www.drupal.org/project/webform  , please 
remake the composer.libraries.json with the command: 
drush webform:libraries:composer > DRUPAL_ROOT/composer.libraries.json
See https://www.drupal.org/docs/contributed-modules/webform/webform-libraries
for details.

## Known limitations

Because most of the configurations in this module should not be changed after
an instance of a site is built, we dont revert the configurations at update
like we do with other WS2 modules. Any small updates in these configurations 
will be asked to be manually changed at the instance level manually. New 
instances will not have this problem.


## Requirements

Drupal 8.x. or Drupal 9.x
