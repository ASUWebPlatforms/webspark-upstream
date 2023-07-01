<?php

namespace Drupal\webspark_isearch\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

class IsearchConfigForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'isearch_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    // Form constructor.
    $form = parent::buildForm($form, $form_state);
    // Default settings.
    $config = $this->config('webspark_isearch.settings');

    $form['solr'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Solr Instance'),
      '#default_value' => $config->get('solr'),
    ];

    $form['directory_path'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Directory path'),
      '#default_value' => $config->get('directory_path'),
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $config = $this->config('webspark_isearch.settings');
    $config->set('solr', $form_state->getValue('solr'));
    $config->set('directory_path', $form_state->getValue('directory_path'));
    $config->save();
    return parent::submitForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return [
      'webspark_isearch.settings',
    ];
  }

}
