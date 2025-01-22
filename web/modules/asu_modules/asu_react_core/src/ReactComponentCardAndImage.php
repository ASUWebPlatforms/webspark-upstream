<?php

namespace Drupal\asu_react_core;

class ReactComponentCardAndImage implements ReactComponent {

  public function buildSettings(&$variables) {
    $block = $variables['content']['#block_content'];
    $rand_id = random_int(0, PHP_INT_MAX);
    $card_and_image = new \stdClass();
    if ($block->field_card && $block->field_card->entity) {
      $card_and_image->cardId = $block->field_card->entity->uuid();
    }
    $settings = [];
    $settings['components']['content_section'][$rand_id] = $card_and_image;
    $variables['content']['#attached']['drupalSettings']['asu'] = $settings;
    $variables['content']['#attached']['library'][] = 'asu_react_core/card';
  }
}
