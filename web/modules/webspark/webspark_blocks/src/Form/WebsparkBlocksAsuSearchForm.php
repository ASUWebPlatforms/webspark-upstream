<?php

/**
 * @file
 * Contains \Drupal\webspark_blocks\Form\AsuUserAdminSettings.
 */

namespace Drupal\webspark_blocks\Form;

use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Routing\TrustedRedirectResponse;

/**
 * Class AsuUserAdminSettings
 * @package Drupal\asu_user\Form
 */
class WebsparkBlocksAsuSearchForm extends FormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'webspark_blocks_asu_search_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $form['icon'] = [
      '#type' => 'html_tag',
      '#tag' => 'i',
      '#attributes' => [
        'class' => ['fas', 'fa-search', 'search-icon'],
      ],
    ];
    $form['search'] = [
      '#type' => 'textfield',
      '#attributes' => [
        'placeholder' => $this->t('Search asu.edu'),
        'onkeypress' => ['if(event.keyCode==13){jQuery(".edit-submit).mousedown();}']
      ],
    ];
    $form['submit'] = [
      '#type' => 'submit',
      '#attributes' => ['hidden' => TRUE]
    ];
    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $keyword = $form_state->getValue('search') ?? '';
    if (\Drupal::moduleHandler()->moduleExists('asu_brand')) {
      (array)$urls = \Drupal::service('asu_brand.helper_functions')->getSearchHosts();
      $keyword = \Drupal::service('asu_brand.helper_functions')->encodeURIComponent($keyword);
    } else {
      $urls = [
        'asu_search_url' => 'https://search.asu.edu/search',
        'url_host' => (\Drupal::request()->getHost() ?? ''),
      ];
      $revert = array('%21'=>'!', '%2A'=>'*', '%28'=>'(', '%29'=>')');
      $keyword = strtr(rawurlencode($keyword), $revert);
    }
    $response = new TrustedRedirectResponse($urls['asu_search_url'] . '?q=' . $keyword . '&url_host=' . $urls['url_host'] . '&sort=date%3AD%3AL%3Ad1&search-tabs=all');
    $form_state->setResponse($response);
  }
}
