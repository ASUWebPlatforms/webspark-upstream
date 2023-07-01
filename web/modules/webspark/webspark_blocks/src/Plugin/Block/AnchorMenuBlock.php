<?php

namespace Drupal\webspark_blocks\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Provides an anchor menu block.
 *
 * @Block(
 *   id = "webspark_blocks_anchor_menu",
 *   admin_label = @Translation("Anchor Menu"),
 *   category = @Translation("ASU")
 * )
 */
class AnchorMenuBlock extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function blockForm($form, FormStateInterface $form_state) {
    $form = parent::blockForm($form, $form_state);
    $form['description'] = [
      '#type' => 'item',
      '#markup' => $this->t('Implementing the Anchor Menu block is a two-step process. After you\'ve added it to your layout, use the Appearance Settings in the other blocks in your layout to add them as targets for the Anchor Menu.'),
    ];
    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function build() {
    $build['#theme'] = 'webspark_blocks_anchor_menu';
    $build['#attached']['library'] = ['webspark_blocks/anchor_menu'];

    return $build;
  }

}
