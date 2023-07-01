<?php

namespace Drupal\webspark_ckeditor_plugins\Plugin\CKEditorPlugin;

use Drupal\editor\Entity\Editor;
use Drupal\ckeditor\CKEditorPluginBase;

/**
 * Defines the "websparkbutton" plugin.
 *
 * @CKEditorPlugin(
 *   id = "websparkbutton",
 *   label = @Translation("Button"),
 *   module = "webspark_ckeditor_plugins"
 * )
 */
class WebsparkButton extends CKEditorPluginBase {

  /**
   * {@inheritdoc}
   */
  public function getFile() {
    return \Drupal::service('extension.list.module')->getPath('webspark_ckeditor_plugins') . '/js/plugins/websparkbutton/plugin.js';
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
    $path = \Drupal::service('extension.list.module')->getPath('webspark_ckeditor_plugins') . '/js/plugins/websparkbutton';
    return [
      'WebsparkButton' => [
        'label' => t('ASU Web Standards Button '),
        'image' => $path . '/icons/websparkbutton.png',
      ]
    ];
  }
}
