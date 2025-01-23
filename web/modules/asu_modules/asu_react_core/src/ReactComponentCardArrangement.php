<?php

namespace Drupal\asu_react_core;

class ReactComponentCardArrangement implements ReactComponent {

  public function buildSettings(&$variables) {
    $block = $variables['content']['#block_content'];

    $rand_id = random_int(0, PHP_INT_MAX);
    $card_arrangement = new \stdClass();
    $card_arrangement->items = [];

    if ($block->field_card_group && $block->field_card_group->entity) {
      foreach ($block->field_card_group->entity->field_cards as $paragraph_ref) {
        $card_arrangement->items[] = $paragraph_ref->entity->uuid();
        $card_arrangement->items_display[$paragraph_ref->entity->uuid()] = $block->field_display_orientation->value;
      }
    }

    $settings = [];
    $settings['components'][$block->bundle()][$rand_id] = $card_arrangement;
    $variables['content']['#attached']['drupalSettings']['asu'] = $settings;
    $variables['content']['#attached']['library'][] = 'asu_react_core/card-arrangement';
  }
}
