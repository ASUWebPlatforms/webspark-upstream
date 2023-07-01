<?php

namespace Drupal\webspark_ckeditor_plugins\Plugin\CKEditorPlugin;

use Drupal\editor\Entity\Editor;
use Drupal\ckeditor\CKEditorPluginBase;

/**
 * Defines the "websparkhighlightedheading" plugin.
 *
 * @CKEditorPlugin(
 *   id = "websparkhighlightedheading",
 *   label = @Translation("Highlighted Heading"),
 *   module = "webspark_ckeditor_plugins"
 * )
 */
class WebsparkHighlightedHeading extends CKEditorPluginBase {

  /**
   * {@inheritdoc}
   */
  public function getFile() {
    return \Drupal::service('extension.list.module')->getPath('webspark_ckeditor_plugins') . '/js/plugins/websparkhighlightedheading/plugin.js';
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
    $path = \Drupal::service('extension.list.module')->getPath('webspark_ckeditor_plugins') . '/js/plugins/websparkhighlightedheading';
    return [
      'WebsparkHighlightedHeading' => [
        'label' => t('ASU Web Standards Higlighted Heading '),
        'image' => $path . '/icons/websparkhighlightedheading.png',
      ]
    ];
  }
}
