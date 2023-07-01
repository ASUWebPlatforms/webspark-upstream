<?php

namespace Drupal\webspark_ckeditor_plugins\Plugin\CKEditorPlugin;

use Drupal\ckeditor\CKEditorPluginBase;
use Drupal\editor\Entity\Editor;

/**
 * Defines the "websparkdivider" plugin.
 *
 * @CKEditorPlugin(
 *   id = "websparkdivider",
 *   label = @Translation("Divider"),
 *   module = "webspark_ckeditor_plugins"
 * )
 */
class WebsparkDivider extends CKEditorPluginBase {

  /**
   * {@inheritdoc}
   */
  public function getFile() {
    return \Drupal::service('extension.list.module')->getPath('webspark_ckeditor_plugins') . '/js/plugins/websparkdivider/plugin.js';
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
  public function getConfig(Editor $editor) {
    return [];
  }

  /**
   * {@inheritdoc}
   */
  public function getButtons() {
    $path = \Drupal::service('extension.list.module')->getPath('webspark_ckeditor_plugins') . '/js/plugins/websparkdivider';
    return [
      'WebsparkDivider' => [
        'label' => t('Divider'),
        'image' => $path . '/icons/websparkdivider.png',
      ]
    ];
  }

}
