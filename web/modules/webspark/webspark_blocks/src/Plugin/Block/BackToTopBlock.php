<?php

namespace Drupal\webspark_blocks\Plugin\Block;

use Drupal\Core\Block\BlockBase;

/**
 * Provides a back to top block.
 *
 * @Block(
 *   id = "webspark_blocks_back_to_top",
 *   admin_label = @Translation("Back to Top"),
 *   category = @Translation("Custom")
 * )
 */
class BackToTopBlock extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {
    return [
      '#theme' => 'block__webspark_blocks__back-to-top',
    ];
  }

}
