<?php

/**
 * @file
 * Contains \Drupal\asu_user\Form\AsuUserAdminSettings.
 */

namespace Drupal\asu_user\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Class AsuUserAdminSettings
 * @package Drupal\asu_user\Form
 */
class AsuUserAdminSettings extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'asu_user_admin_settings';
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return ['asu_user.settings'];
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {

    // elastic server query URL to use.
    $form['asu_user_elastic_query_url'] = [
      '#type' => 'textfield',
      '#default_value' => \Drupal::config('asu_user.settings')->get('asu_user_elastic_query_url'),
      '#title' => $this->t('ASU elastic Query URL'),
      '#description' => $this->t('Provide the ASU elastic People Query URL. Probably https://asudir-elastic.asu.edu/asudir/directory/select'),
      '#required' => TRUE,
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $config = $this->config('asu_user.settings');
    $config->set('asu_user_elastic_query_url', $form_state->getValue('asu_user_elastic_query_url'));
    $config->save();
    return parent::submitForm($form, $form_state);
  }

}
