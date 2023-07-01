<?php

namespace Drupal\webspark_ckeditor_plugins\Plugin\CKEditorPlugin;

use Drupal\editor\Entity\Editor;
use Drupal\ckeditor\CKEditorPluginBase;

/**
 * Defines the "Webspark Table" plugin.
 *
 * @CKEditorPlugin(
 *   id = "websparkTable",
 *   label = @Translation("Webspark table"),
 *   module = "webspark_ckeditor_plugins"
 * )
 */
class WebsparkTable extends CKEditorPluginBase {

  /**
   * {@inheritdoc}
   */
  public function getFile() {
    return \Drupal::service('extension.list.module')->getPath('webspark_ckeditor_plugins') . '/js/plugins/websparktable/plugin.js';
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
    $path = \Drupal::service('extension.list.module')->getPath('webspark_ckeditor_plugins') . '/js/plugins/websparktable';
    return [
      'WebsparkTable' => [
        'label' => t('Webspark table plugin'),
        'image' => $path . '/icons/websparkTable.png',
      ]
    ];
  }

}
