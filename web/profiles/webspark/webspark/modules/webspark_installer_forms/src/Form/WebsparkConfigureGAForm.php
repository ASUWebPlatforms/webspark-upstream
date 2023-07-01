<?php

namespace Drupal\webspark_installer_forms\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Provides the Google Analytics configuration form.
 */
class WebsparkConfigureGAForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return [];
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'webspark_install_configure_ga_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $form['#title'] = $this->t('Webspark Config: Google Analytics');

    $form['has_ga_account'] = [
      '#type' => 'checkbox',
      '#title' => t('Do you have a Google Analytics account separate from the main ASU account?'),
    ];
    $form['google_analytics_account'] = [
      '#description' => $this->t('Enter your custom GA ID (ex. UA-xxxxxxx-yy) to send ' .
        ' tracking information to from this site. Entering this ID will not affect or override ASU\'s main Google account.'),
      '#maxlength' => 20,
      '#placeholder' => 'UA-',
      '#size' => 20,
      '#title' => $this->t('Web Property ID'),
      '#type' => 'textfield',
      '#states' => [
        'visible' => [
          ':input[name="has_ga_account"]' =>['checked' => TRUE],
        ],
        'required' => [
          ':input[name="has_ga_account"]' =>['checked' => TRUE],
        ],
      ],
    ];

    $form['actions'] = ['#type' => 'actions'];
    $form['actions']['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Save and continue'),
      '#weight' => 15,
      '#button_type' => 'primary',
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $config_factory = \Drupal::configFactory();
    $config_factory->getEditable('asu_brand.settings')
      ->set('asu_brand.asu_brand_extra_gtm_id', $form_state->getValue('google_analytics_account'))
      ->save();
  }

}
