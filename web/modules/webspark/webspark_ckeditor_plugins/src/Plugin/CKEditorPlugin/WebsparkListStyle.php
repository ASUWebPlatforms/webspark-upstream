<?php

namespace Drupal\webspark_ckeditor_plugins\Plugin\CKEditorPlugin;

use Drupal\Component\Plugin\PluginBase;
use Drupal\editor\Entity\Editor;
use Drupal\ckeditor\CKEditorPluginInterface;
use Drupal\ckeditor\CKEditorPluginContextualInterface;

/**
 * Defines the "List Style" plugin.
 *
 * @CKEditorPlugin(
 *   id = "liststyle",
 *   label = @Translation("List Style")
 * )
 */
class WebsparkListStyle extends PluginBase implements CKEditorPluginInterface, CKEditorPluginContextualInterface {

  /**
   * {@inheritdoc}
   */
  public function getButtons() {
    return [];
  }

  /**
   * {@inheritdoc}
   */
  public function isEnabled(Editor $editor) {
    $enabled = FALSE;
    $settings = $editor->getSettings();
    foreach ($settings['toolbar']['rows'] as $row) {
      foreach ($row as $group) {
        foreach ($group['items'] as $button) {
          if (($button === 'BulletedList') || ($button === 'NumberedList')) {
            $enabled = TRUE;
          }
        }
      }
    }

    return $enabled;
  }

  /**
   * {@inheritdoc}
   */
  public function isInternal() {
    return FALSE;
  }

  /**
   * {@inheritdoc}
   */
  public function getDependencies(Editor $editor) {
    return [];
  }

  /**
   * {@inheritdoc}
   */
  public function getLibraries(Editor $editor) {
    return [];
  }

  /**
   * {@inheritdoc}
   */
  public function getFile() {

    $plugin = FALSE;

    // Get plugin path.
    $plugin_path = \Drupal::service('extension.list.module')->getPath('webspark_ckeditor_plugins') . '/js/plugins/websparkliststyle/plugin.js';

    if (file_exists(DRUPAL_ROOT . '/' . $plugin_path)) {
      $plugin = $plugin_path;
    }

    return $plugin;
  }

  /**
   * {@inheritdoc}
   */
  public function getConfig(Editor $editor) {
    return [];
  }

}
