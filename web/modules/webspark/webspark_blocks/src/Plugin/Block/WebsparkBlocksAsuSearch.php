<?php

namespace Drupal\webspark_blocks\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Form\FormStateInterface;


/**
 * Provides the ASU footer block which deploys the component footer.
 *
 * @Block(
 *   id = "webspark_asu_search_block",
 *   admin_label = @Translation("Webspark Asu Search Block"),
 *   category = @Translation("Webspark blocks"),
 * )
 */
class WebsparkBlocksAsuSearch extends BlockBase {


  /**
   * {@inheritdoc}
   */
  public function build() {

    $search_form = \Drupal::formBuilder()->getForm('Drupal\webspark_blocks\Form\WebsparkBlocksAsuSearchForm');
    return [
      '#theme' => 'webspark_blocks__asu_search',
      '#subtitle' => t("Search all of ASU"),
      '#form' => $search_form,
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function blockForm($form, FormStateInterface $form_state) {
    $form = parent::blockForm($form, $form_state);

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function blockSubmit($form, FormStateInterface $form_state) {
    parent::blockSubmit($form, $form_state);
  }

}
