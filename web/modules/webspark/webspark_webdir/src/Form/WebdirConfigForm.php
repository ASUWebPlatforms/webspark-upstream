<?php

namespace Drupal\webspark_webdir\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

class WebdirConfigForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'webdir_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    // Form constructor.
    $form = parent::buildForm($form, $form_state);
    // Default settings.
    $config = $this->config('webspark_webdir.settings');

    $form['api'] = [
      '#type' => 'textfield',
      '#title' => $this->t('API URL'),
      '#default_value' => $config->get('api'),
      '#description' => $this->t('URL to Web Directory API. Example: https://search.asu.edu'),
    ];

    $form['api_version'] = [
      '#type' => 'textfield',
      '#title' => $this->t('API Version'),
      '#default_value' => $config->get('api_version') ?? '/api/v1/',
      '#description' => $this->t('API Version path. Example: /api/v1/'),
    ];

    $form['departments'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Departments'),
      '#default_value' => $config->get('departments'),
    ];
    
    $form['people_department'] = [
      '#type' => 'textfield',
      '#title' => $this->t('People in department'),
      '#default_value' => $config->get('people_department'),
    ];
    
    $form['filtered_people_department'] = [
      '#type' => 'textfield',
      '#title' => $this->t('People in department by filter'),
      '#default_value' => $config->get('filtered_people_department'),
    ];
    
    $form['people_search'] = [
      '#type' => 'textfield',
      '#title' => $this->t('People search'),
      '#default_value' => $config->get('people_search'),
    ];
    
    $form['profile_affiliations'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Profile Affiliations'),
      '#default_value' => $config->get('profile_affiliations'),
    ];
    
    $form['people_data'] = [
      '#type' => 'textfield',
      '#title' => $this->t('People data'),
      '#default_value' => $config->get('people_data'),
    ];
    
    $form['employee_types'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Employee Types'),
      '#default_value' => $config->get('employee_types'),
    ];
    
    $form['expertise_areas'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Expertise Areas'),
      '#default_value' => $config->get('expertise_areas'),
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $config = $this->config('webspark_webdir.settings');
    $config->set('api', $form_state->getValue('api'));
    $config->set('api_version', $form_state->getValue('api_version'));
    $config->set('departments', $form_state->getValue('departments'));
    $config->set('people_department', $form_state->getValue('people_department'));
    $config->set('filtered_people_department', $form_state->getValue('filtered_people_department'));
    $config->set('people_search', $form_state->getValue('people_search'));
    $config->set('profile_affiliations', $form_state->getValue('profile_affiliations'));
    $config->set('people_data', $form_state->getValue('people_data'));
    $config->set('employee_types', $form_state->getValue('employee_types'));
    $config->set('expertise_areas', $form_state->getValue('expertise_areas'));
    $config->save();
    return parent::submitForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return [
      'webspark_webdir.settings',
    ];
  }

}
