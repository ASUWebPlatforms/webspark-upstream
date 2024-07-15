<?php declare(strict_types = 1);

namespace Drupal\asu_data_potluck\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Configure Asu data potluck settings for this site.
 */
final class SettingsForm extends ConfigFormBase {

  /**
   * @var string
   */
  private const DEFAULT_ENDPOINT = 'https://api.myasuplat-dpl.asu.edu/api/';

  /**
   * {@inheritdoc}
   */
  public function getFormId(): string {
    return 'asu_data_potluck_settings';
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames(): array {
    return ['asu_data_potluck.settings'];
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    // Build and return the form array.
    // Loads admin settings for this form/module.
    $config = $this->config('asu_data_potluck.settings');

    $form['asu_data_potluck']['asu_data_potluck_instructions'] = [
      '#type' => 'item',
      '#title' => $this->t("About the ASU Data Potluck module"),
      '#description' => $this->t("The ASU Data Potluck module provides
       access to the ASU Data Potluck data source via REST API calls."),
    ];

    $form['asu_data_potluck']['potluck'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('ASU Data Potluck settings'),
    ];
    $form['asu_data_potluck']['potluck']['datasource_endpoint'] = [
      '#type' => 'url',
      '#title' => $this->t('ASU Data Potluck data source URL'),
      '#default_value' => $config->get('asu_data_potluck.datasource_endpoint') === self::DEFAULT_ENDPOINT ? NULL : $config->get('asu_data_potluck.datasource_endpoint'),
      '#description' => $this->t("Recommended to be left blank to use default data source (https://api.myasuplat-dpl.asu.edu/api/)."),
    ];
    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state): void {
     if (!empty($form_state->getValue('datasource_endpoint')) && !preg_match('/^https?:\/\/.*?\..*?$/m', $form_state->getValue('datasource_endpoint'))) {
       $form_state->setErrorByName(
         'message',
         $this->t('Please enter a fully qualified URL.'),
       );
     }
    parent::validateForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    $formEndpoint = $form_state->getValue('datasource_endpoint');
    $endpoint = empty($formEndpoint) ? self::DEFAULT_ENDPOINT : $formEndpoint;
    $this->config('asu_data_potluck.settings')
      ->set('asu_data_potluck.datasource_endpoint', $endpoint)
      ->save();
    parent::submitForm($form, $form_state);
  }

}
