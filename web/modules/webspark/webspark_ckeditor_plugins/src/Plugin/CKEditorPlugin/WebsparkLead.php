<?php

namespace Drupal\webspark_ckeditor_plugins\Plugin\CKEditorPlugin;

use Drupal\editor\Entity\Editor;
use Drupal\ckeditor\CKEditorPluginBase;

/**
 * Defines the "websparklead" plugin.
 *
 * @CKEditorPlugin(
 *   id = "websparklead",
 *   label = @Translation("Lead"),
 *   module = "webspark_ckeditor_plugins"
 * )
 */
class WebsparkLead extends CKEditorPluginBase {

  /**
   * {@inheritdoc}
   */
  public function getFile() {
    return \Drupal::service('extension.list.module')->getPath('webspark_ckeditor_plugins') . '/js/plugins/websparklead/plugin.js';
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
    $path = \Drupal::service('extension.list.module')->getPath('webspark_ckeditor_plugins') . '/js/plugins/websparklead';
    return [
      'WebsparkLead' => [
        'label' => t('ASU Web Standards Lead '),
        'image' => $path . '/icons/websparklead.png',
      ]
    ];
  }
}
