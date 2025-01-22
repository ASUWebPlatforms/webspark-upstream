<?php

/**
 * @file
 * Contains \DrupalComposerManaged\ComposerScripts.
 *
 * Custom Composer scripts and implementations of Composer hooks.
 */

namespace DrupalComposerManaged;

use Composer\IO\IOInterface;
use Composer\Script\Event;
use Composer\Util\Filesystem;
use Composer\Util\ProcessExecutor;
use Composer\Plugin\PreCommandRunEvent;

/**
 * Implementation for Composer scripts and Composer hooks.
 */
class ComposerScripts {

  /**
   * Prepare for Composer to update dependencies.
   *
   * Composer will attempt to guess the version to use when evaluating
   * dependencies for path repositories. This has the undesirable effect
   * of producing different results in the composer.lock file depending on
   * which branch was active when the update was executed. This can lead to
   * unnecessary changes, and potentially merge conflicts when working with
   * path repositories on Pantheon multidevs.
   *
   * To work around this problem, it is possible to define an environment
   * variable that contains the version to use whenever Composer would normally
   * "guess" the version from the git repository branch. We set this invariantly
   * to "dev-main" so that the composer.lock file will not change if the same
   * update is later ran on a different branch.
   *
   * @see https://github.com/composer/composer/blob/main/doc/articles/troubleshooting.md#dependencies-on-the-root-package
   */
  public static function preUpdate(Event $event) {
    $io = $event->getIO();

    // We will only set the root version if it has not already been overriden
    if (!getenv('COMPOSER_ROOT_VERSION')) {
      // This is not an error; rather, we are writing to stderr.
      $io->writeError("<info>Using version 'dev-main' for path repositories.</info>");

      putenv('COMPOSER_ROOT_VERSION=dev-main');
    }

    // Apply updates to top-level composer.json
    static::applyComposerJsonUpdates($event);
  }

  /**
   * postUpdate
   *
   * After "composer update" runs, we have the opportunity to do additional
   * fixups to the project files.
   *
   * @param Composer\Script\Event $event
   *   The Event object passed in from Composer
   */
  public static function postUpdate(Event $event) {
    $io = $event->getIO();

    // Check for FontAwesome library's existence
    $fa_install = is_dir('web/libraries/fontawesome');
    if ($fa_install) {
      // Get ASUAwesome icons icon list.
      $asuawesome_icon_list = file_get_contents('web/themes/webspark/renovation/asuawesome-iconlist.yml');
      // Custom Renovation ASUAwesome icon list.
      $renovation_icon_list = 'web/themes/webspark/renovation/renovation.fontawesome.iconlist.yml';
      // Write ASUAwesome icons to the ASUAwesome custom icon list.
      file_put_contents($renovation_icon_list, $asuawesome_icon_list);
      // Get Font Awesome icon list.
      $font_awesome_icons = file_get_contents('web/libraries/fontawesome/metadata/icons.yml');
      // Append FontAwesome icons to the ASUAwesome custom icon list.
      file_put_contents($renovation_icon_list, $font_awesome_icons, FILE_APPEND);

      // Write out success message to console.
      $io->writeError("<info>Successfully combined ASUAwesome and Font Awesome icons</info>");
    }
  }

  /**
   * Apply composer.json Updates
   *
   * During the Composer pre-update hook, check to see if there are any
   * updates that need to be made to the composer.json file. We cannot simply
   * change the composer.json file in the upstream, because doing so would
   * result in many merge conflicts.
   */
  public static function applyComposerJsonUpdates(Event $event) {
    $io = $event->getIO();

    $composerJsonContents = file_get_contents("composer.json");
    $composerJson = json_decode($composerJsonContents, true);
    $originalComposerJson = $composerJson;

    // Check to see if the platform PHP version (which should be major.minor.patch)
    // is the same as the Pantheon PHP version (which is only major.minor).
    // If they do not match, force an update to the platform PHP version. If they
    // have the same major.minor version, then
    $platformPhpVersion = static::getCurrentPlatformPhp($event);
    $pantheonPhpVersion = static::getPantheonPhpVersion($event);
    $updatedPlatformPhpVersion = static::bestPhpPatchVersion($pantheonPhpVersion);
    if ((substr($platformPhpVersion, 0, strlen($pantheonPhpVersion)) != $pantheonPhpVersion) && !empty($updatedPlatformPhpVersion)) {
      $io->write("<info>Setting platform.php from '$platformPhpVersion' to '$updatedPlatformPhpVersion' to conform to pantheon php version.</info>");
      $composerJson['config']['platform']['php'] = $updatedPlatformPhpVersion;
    }

    // add our post-update-cmd hook if it's not already present
    $our_hook = 'DrupalComposerManaged\\ComposerScripts::postUpdate';
    // if does not exist, add as an empty arry
    if(! isset($composerJson['scripts']['post-update-cmd'])) {
      $composerJson['scripts']['post-update-cmd'] = [];
    }

    // if exists and is a string, convert to a single-item array (n.b. do not actually need the if exists check because we just assured that it does)
    if(is_string($composerJson['scripts']['post-update-cmd'])) {
      $composerJson['scripts']['post-update-cmd'] = [$composerJson['scripts']['post-update-cmd']];
    }

    // if exists and is an array and does not contain our hook, add our hook (again, only the last check is needed)
    if(! in_array($our_hook, $composerJson['scripts']['post-update-cmd'])) {
      $io->write("<info>Adding post-update-cmd hook to composer.json</info>");
      $composerJson['scripts']['post-update-cmd'][] = $our_hook;

      // We're making our other changes if and only if we're already adding our hook
      // so that we don't overwrite customer's changes if they undo these changes.
      // We don't want customers to remove our hook, so it will be re-added if they remove it.

      // Remove our upstream convenience scripts, if the user has not removed them.
      if (isset($composerJson['scripts']['upstream-require'])) {
        unset($composerJson['scripts']['upstream-require']);
      }

      // Also remove it from the scripts-descriptions section.
      if (isset($composerJson['scripts-descriptions']['upstream-require'])) {
        unset($composerJson['scripts-descriptions']['upstream-require']);
      }

      // This may have been the last item in the scripts-descriptions section, so remove it.
      if (isset($composerJson['scripts-descriptions']) && empty($composerJson['scripts-descriptions'])) {
        unset($composerJson['scripts-descriptions']);
      }

      // enable patching if it isn't already enabled
      if(! isset($composerJson['extra']['enable-patching'])) {
        $io->write("<info>Setting enable-patching to true</info>");
        $composerJson['extra']['enable-patching'] = true;
      }

      // allow phpstan/extension-installer in preparation for Drupal 10
      if(! isset($composerJson['config']['allow-plugins']['phpstan/extension-installer'])) {
        $io->write("<info>Allow phpstan/extension-installer in preparation for Drupal 10</info>");
        $composerJson['config']['allow-plugins']['phpstan/extension-installer'] = true;
      }

      // allow php-http/discovery
      if(! isset($composerJson['config']['allow-plugins']['php-http/discovery'])) {
        $io->write("<info>Allow php-http/discovery</info>");
        $composerJson['config']['allow-plugins']['php-http/discovery'] = true;
      }
    }

    if(serialize($composerJson) == serialize($originalComposerJson)) {
      return;
    }

    // Write the updated composer.json file
    $composerJsonContents = static::jsonEncodePretty($composerJson);
    file_put_contents("composer.json", $composerJsonContents . PHP_EOL);
  }

  /**
   * jsonEncodePretty
   *
   * Convert a nested array into a pretty-printed json-encoded string.
   *
   * @param array $data
   *   The data array to encode
   * @return string
   *   The pretty-printed encoded string version of the supplied data.
   */
  public static function jsonEncodePretty(array $data) {
    $prettyContents = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    $prettyContents = preg_replace('#": \[\s*("[^"]*")\s*\]#m', '": [\1]', $prettyContents);

    return $prettyContents;
  }

  /**
   * Get current platform.php value.
   */
  private static function getCurrentPlatformPhp(Event $event) {
    $composer = $event->getComposer();
    $config = $composer->getConfig();
    $platform = $config->get('platform') ?: [];
    if (isset($platform['php'])) {
      return $platform['php'];
    }
    return null;
  }

  /**
   * Get the PHP version from pantheon.yml or pantheon.upstream.yml file.
   */
  private static function getPantheonConfigPhpVersion($path) {
    if (!file_exists($path)) {
      return null;
    }
    if (preg_match('/^php_version:\s?(\d+\.\d+)$/m', file_get_contents($path), $matches)) {
      return $matches[1];
    }
  }

  /**
   * Get the PHP version from pantheon.yml.
   */
  private static function getPantheonPhpVersion(Event $event) {
    $composer = $event->getComposer();
    $config = $composer->getConfig();
    $pantheonYmlPath = dirname($config->get('vendor-dir')) . '/pantheon.yml';
    $pantheonUpstreamYmlPath = dirname($config->get('vendor-dir')) . '/pantheon.upstream.yml';

    if ($pantheonYmlVersion = static::getPantheonConfigPhpVersion($pantheonYmlPath)) {
      return $pantheonYmlVersion;
    } elseif ($pantheonUpstreamYmlVersion = static::getPantheonConfigPhpVersion($pantheonUpstreamYmlPath)) {
      return $pantheonUpstreamYmlVersion;
    }
    return null;
  }

  /**
   * Determine which patch version to use when the user changes their platform php version.
   */
  private static function bestPhpPatchVersion($pantheonPhpVersion) {
    // Drupal 10 requires PHP 8.1 at a minimum.
    // Drupal 9 requires PHP 7.3 at a minimum.
    // Integrated Composer requires PHP 7.1 at a minimum.
    $patchVersions = [
      '8.3' => '8.3.0',
      '8.2' => '8.2.0',
      '8.1' => '8.1.13',
      '8.0' => '8.0.26',
      '7.4' => '7.4.33',
      '7.3' => '7.3.33',
      '7.2' => '7.2.34',
      '7.1' => '7.1.33',
    ];
    if (isset($patchVersions[$pantheonPhpVersion])) {
      return $patchVersions[$pantheonPhpVersion];
    }
    // This feature is disabled if the user selects an unsupported php version.
    return '';
  }

  /**
   * Merge the upstream and custom patches into a single file.
   *
   * @param PreCommandRunEvent $event
   *
   * @return void
   */
  public static function writeComposerPatchFile(PreCommandRunEvent $event) {
    $websparkPath = 'upstream-configuration/patches.webspark.json';
    $customPath = 'custom-dependencies/patches.custom.json';
    $websparkArray = json_decode(file_get_contents($websparkPath), true);
    $customArray = json_decode(file_get_contents($customPath), true);
    $combinedArray['patches'] = array_merge_recursive($websparkArray, $customArray);
    $combinedJson = json_encode($combinedArray);

    file_put_contents("composer.patches.json", $combinedJson . PHP_EOL);
  }
}
