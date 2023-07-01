<?php

namespace Drupal\webspark_installer_forms\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Provides the Header configuration form.
 */
class WebsparkConfigureHeaderForm extends ConfigFormBase {

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
    return 'webspark_install_configure_header_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $form['#title'] = $this->t('Webspark Config: Parent Unit');

    $form['explanation'] = [
      '#markup' => '<h3>Add parent unit</h3><p>If this site is for a department/college/unit ' .
        'that has a parent unit to be displayed in the site\'s header, enter that information below.' .
        '<h4>Header example with Parent unit:</h4>' .
        '<img src="/profiles/webspark/webspark/modules/webspark_installer_forms/img/parent-unit-header.jpg" ' .
        'alt="Parent unit example" style="margin-top: 1rem; opacity: 0.6;" /></p>',
    ];
    $form['parent_unit_name'] = [
      '#maxlength' => 50,
      '#size' => 50,
      '#title' => $this->t('Parent unit name'),
      '#type' => 'textfield',
      '#default_value' => '',
      '#states' => [
        'required' => [
          ':input[name="parent_department_url"]' =>['filled' => TRUE],
        ],
      ],
    ];
    $form['parent_department_url'] = [
      '#maxlength' => 255,
      '#size' => 100,
      '#title' => $this->t('Parent Department URL'),
      '#type' => 'url',
      '#default_value' => '',
      '#states' => [
        'required' => [
          ':input[name="parent_unit_name"]' =>['filled' => TRUE],
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
    $block = $config_factory->getEditable('block.block.asubrandheader');
    $block->set('settings.asu_brand_header_block_parent_org', $form_state->getValue('parent_unit_name'));
    $block->set('settings.asu_brand_header_block_parent_org_url', $form_state->getValue('parent_department_url'));
    $block->save(TRUE);
  }

}
