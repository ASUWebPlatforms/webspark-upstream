<?php

namespace Drupal\webspark_ckeditor_plugins\Plugin\CKEditorPlugin;

use Drupal\editor\Entity\Editor;
use Drupal\ckeditor\CKEditorPluginBase;

/**
 * Defines the "websparkblockquote" plugin.
 *
 * @CKEditorPlugin(
 *   id = "websparkblockquote",
 *   label = @Translation("Blockquote"),
 *   module = "webspark_ckeditor_plugins"
 * )
 */
class WebsparkBlockquote extends CKEditorPluginBase {

  /**
   * {@inheritdoc}
   */
  public function getFile() {
    return \Drupal::service('extension.list.module')->getPath('webspark_ckeditor_plugins') . '/js/plugins/websparkblockquote/plugin.js';
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
    $path = \Drupal::service('extension.list.module')->getPath('webspark_ckeditor_plugins') . '/js/plugins/websparkblockquote';
    return [
      'WebsparkBlockquote' => [
        'label' => t('ASU Web Standards Blockquote '),
        'image' => $path . '/icons/websparkblockquote.png',
      ]
    ];
  }
}
