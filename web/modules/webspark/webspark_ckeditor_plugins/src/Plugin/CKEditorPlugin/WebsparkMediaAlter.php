<?php

namespace Drupal\webspark_ckeditor_plugins\Plugin\CKEditorPlugin;

use Drupal\Core\Plugin\PluginBase;
use Drupal\editor\Entity\Editor;
use Drupal\ckeditor\CKEditorPluginInterface;
use Drupal\ckeditor\CKEditorPluginContextualInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\ckeditor\CKEditorPluginConfigurableInterface;

/**
 * Defines the "websparkmediaalter" plugin.
 *
 * @CKEditorPlugin(
 *   id = "websparkmediaalter",
 *   label = @Translation("Webspark Media Alter"),
 *   module = "ckeditor"
 * )
 */
class WebsparkMediaAlter extends PluginBase implements CKEditorPluginInterface, CKEditorPluginContextualInterface, CKEditorPluginConfigurableInterface {

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
    return \Drupal::service('extension.list.module')->getPath('webspark_ckeditor_plugins') . '/js/plugins/' . $this->getPluginId() . '/plugin.js';
  }

  /**
   * {@inheritdoc}
   */
  public function getConfig(Editor $editor) {
    return [];
  }

  /**
   * {@inheritdoc}
   *
   * @see \Drupal\editor\Form\EditorImageDialog
   * @see editor_image_upload_settings_form()
   */
  public function settingsForm(array $form, FormStateInterface $form_state, Editor $editor) {

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function isEnabled(Editor $editor) {
    // Check if a DrupalMediaLibrary has been placed in the CKeditor.
    $settings = $editor->getSettings();
    if ($this->checkMediaLibraryEnable($settings['toolbar']['rows'][0])) {
      return TRUE;
    }

    return FALSE;
  }

  /**
   * Check if a DrupalMediaLibrary exists in the given toolbar row.
   *
   * @param array $toolbar
   *   A CKeditor toolbar row containing Ckeditor plugin items.
   *
   * @return bool
   *   Does the DrupalMediaLibrary has been placed in the CKeditor.
   */
  protected function checkMediaLibraryEnable(array $toolbar) {
    foreach ($toolbar as $items) {
      foreach ($items['items'] as $item) {
        if ('DrupalMediaLibrary' === $item) {
          return TRUE;
        }
      }
    }

    return FALSE;
  }

}
