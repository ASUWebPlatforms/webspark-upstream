<?php

/**
 * @file
 * Enables modules and site configuration for a webspark site installation.
 */

use Drupal\contact\Entity\ContactForm;
use Drupal\Core\Form\FormStateInterface;
use Drupal\user\Entity\User;

/**
 * Implements hook_install_tasks().
 */
function webspark_install_tasks(&$install_state) {
  // Custom GA account?
  $tasks['webspark_install_configure_simplexml_form'] = [
    'display_name' => t('Base URL'),
    'type' => 'form',
    'run' => INSTALL_TASK_RUN_IF_NOT_COMPLETED,
    'function' => 'Drupal\webspark_installer_forms\Form\WebsparkConfigureSitemapXMLForm',
  ];
  // Parent name + URL?
  $tasks['webspark_install_configure_header_form'] = [
    'display_name' => t('Parent unit'),
    'type' => 'form',
    'run' => INSTALL_TASK_RUN_IF_NOT_COMPLETED,
    'function' => 'Drupal\webspark_installer_forms\Form\WebsparkConfigureHeaderForm',
  ];
  // Custom GA account?
  $tasks['webspark_install_configure_ga_form'] = [
    'display_name' => t('Custom Google Analytics account'),
    'type' => 'form',
    'run' => INSTALL_TASK_RUN_IF_NOT_COMPLETED,
    'function' => 'Drupal\webspark_installer_forms\Form\WebsparkConfigureGAForm',
  ];
  return $tasks;
}

/**
 * Implements hook_form_FORM_ID_alter() for install_configure_form().
 *
 * Allows the profile to alter the site configuration form.
 */
function webspark_form_install_configure_form_alter(&$form, FormStateInterface $form_state): void {
  $form['admin_account']['openasu_admin_asurite'] = [
    '#title' => 'ASURITE User ID',
    '#description' => t('Associate admin account with ASURITE User'),
    '#type' => 'textfield',
    '#required' => FALSE,
    '#weight' => 20,
  ];
  $form['regional_settings']['site_default_country']['#default_value'] = 'US';
  $form['#submit'][] = 'webspark_form_install_configure_submit';
}

/**
 * Submission handler to sync the contact.form.feedback recipient.
 */
function webspark_form_install_configure_submit($form, FormStateInterface $form_state): void {
  //Set header block title.
  $config_factory = \Drupal::configFactory();
  $block = $config_factory->getEditable('block.block.asubrandheader');
  $block->set('settings.asu_brand_header_block_title', $form_state->getValue('site_name'));
  $block->save(TRUE);

  // If the ASURITE User ID is populated during installation
  // then the CAS Username from the account of the admin user will be stored.
  if(!empty($form_state->getValue('openasu_admin_asurite'))) {
    $user = User::load(1);
    $cas_user_manager = \Drupal::service('cas.user_manager');
    $cas_user_manager->setCasUsernameForAccount($user, $form_state->getValue('openasu_admin_asurite'));
  }
}

/**
 * Implements hook_preprocess_template().
 */
function webspark_preprocess_install_page(&$variables) {
  $variables['site_name'] = 'Webspark';
}