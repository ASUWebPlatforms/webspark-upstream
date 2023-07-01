<?php

namespace Drupal\webspark_installer_forms\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Component\Utility\UrlHelper;

/**
 * Provides the Google Analytics configuration form.
 */
class WebsparkConfigureSitemapXMLForm extends ConfigFormBase {

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
    return 'webspark_install_configure_simplexml_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $form['#title'] = $this->t('Webspark Config: Base URL');

    $form['explanation'] = [
      '#markup' => '<p>Enter the base URL expected to be used with this site when it launches ' .
        '(ex. https://mysite.engineering.asu.edu, https://topleveldomain.asu.edu). ' .
        'This will help with search results and SEO.</p>' .
        '<p>If the base URL is still TBD, leave this blank because it can be added ' .
        'later under the Simple XML Sitemap settings.</p>' .
        '<p><strong>NOTE:</strong> After this installation process is complete, go to /admin/config/system/cron ' .
        'and "Run Cron" once so that this change takes effect immediately.</p>',
    ];

    $form['simplexml_base_url'] = [
      '#maxlength' => 64,
      '#placeholder' => 'https://',
      '#size' => 40,
      '#title' => $this->t('Base URL'),
      '#type' => 'url',
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
  public function validateForm(array &$form, FormStateInterface $form_state) {
    // Repurposed simpleXML module's validate form
    $base_url = $form_state->getValue('simplexml_base_url');
    $form_state->setValue('simplexml_base_url', rtrim($base_url, '/'));
    if ($base_url !== '' && !UrlHelper::isValid($base_url, TRUE)) {
      $form_state->setErrorByName('simplexml_base_url', $this->t('Not a valid URL.'));
    }
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $config_factory = \Drupal::configFactory();
    $config_factory->getEditable('simple_sitemap.settings')
      ->set('base_url', $form_state->getValue('simplexml_base_url'))
      ->save();
    $generator = \Drupal::service('simple_sitemap.generator');
    $generator->generate("cron");
  }

}
