<?php

/**
 * Load services definition file.
 */
$settings['container_yamls'][] = __DIR__ . '/services.yml';

/**
 * Include the Pantheon-specific settings file.
 *
 * n.b. The settings.pantheon.php file makes some changes
 *      that affect all environments that this site
 *      exists in.  Always include this file, even in
 *      a local development environment, to ensure that
 *      the site settings remain consistent.
 */
include __DIR__ . "/settings.pantheon.php";

/**
 * Skipping permissions hardening will make scaffolding
 * work better, but will also raise a warning when you
 * install Drupal.
 *
 * https://www.drupal.org/project/drupal/issues/3091285
 */
// $settings['skip_permissions_hardening'] = TRUE;

/**
 * Enable the configuration readonly functionality.
 */
if (PHP_SAPI !== 'cli') {
  $settings['config_readonly'] = TRUE;
}

/**
 * Allow all configuration to be changed.
 */
$settings['config_readonly_whitelist_patterns'] = ['*'];

/**
 * Allow files to be deleted from the file system, similar to Drupal 7.
 * See: https://www.drupal.org/node/2891902
 */
$config['file.settings']['make_unused_managed_files_temporary'] = TRUE;

/**
 * If there is a local settings file, then include it
 */
$local_settings = __DIR__ . "/settings.local.php";

if (file_exists($local_settings)) {
  include $local_settings;
}
