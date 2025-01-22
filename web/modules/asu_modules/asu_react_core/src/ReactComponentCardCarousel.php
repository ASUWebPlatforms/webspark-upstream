<?php

namespace Drupal\asu_react_core;

class ReactComponentCardCarousel implements ReactComponent {

  public function buildSettings(&$variables) {
    $block = $variables['content']['#block_content'];

    $rand_id = random_int(0, PHP_INT_MAX);
    $carousel_card_id = 'cardCarouselContainer-' . $rand_id;
    $block_id = 'asu-card-carousel-container-' . $rand_id;

    $variables['content']['#prefix'] = '<div id="' . $carousel_card_id . '"></div>';
    $variables['attributes']['id'] = $block_id;
    $variables['attributes']['class'][] = 'asu-card-carousel-container';

    $card_carousel = new \stdClass();
    $card_carousel->targetSelector = $carousel_card_id;
    $card_carousel->items = [];

    if ($block->field_card_orientation) {
      $card_carousel->cardHorizontal = (bool) $block->field_card_orientation->value;
    }
    if ($block->field_layout) {
      $card_carousel->perView = $block->field_layout->value;
    }

    foreach ($block->field_card_group->entity->field_cards as $paragraph_ref) {
      $card_carousel->items[] = $paragraph_ref->entity->uuid();
    }

    if ($block->field_card_group && $block->field_card_group->entity) {
      $group_type = $block->field_card_group->entity->bundle();
      switch ($group_type) {
        case 'card_group_default':
          $card_carousel->cardType = 'default';
          break;
        case 'card_group_degree':
          $card_carousel->cardType = 'degree';
          break;
        case 'card_group_story':
          $card_carousel->cardType = 'story';
          break;
      }
    }

    $settings = [];
    $settings['components'][$block->bundle()][$rand_id] = $card_carousel;

    $variables['content']['#attached']['drupalSettings']['asu'] = $settings;
    $variables['content']['#attached']['library'][] = 'asu_react_core/card_carousel';
  }
}
