<?php

namespace Drupal\asu_react_core;

class ReactComponentTestimonialOnImageBackground implements ReactComponent {

  public function buildSettings(&$variables) {
    $block = $variables['content']['#block_content'];

    $rand_id = random_int(0, PHP_INT_MAX);
    $variables['attributes']['class'][] = 'asu-testimonial-on-image-container';

    $variables['attributes']['id'] = 'asu-testimonial-on-image-container-' . $rand_id;

    $testimonial_block = new \stdClass();
    $testimonial_block->items = [];
    $testimonial_block->style = [];
    $testimonial_block->itemTitleCssClass = [];


    if ($block->field_text_color->value) {
      $testimonial_block->style[] = $block->field_text_color->value;
    }
    if ($block->field_accent_color->value) {
      $testimonial_block->style[] = $block->field_accent_color->value;
    }
    if ($block->field_heading_highlight->value) {
      $testimonial_block->itemTitleCssClass[] = $block->field_heading_highlight->value;
    }

    foreach ($block->field_testimonial_component as $paragraph_ref) {
      $testimonial_block->items[] = $paragraph_ref->entity->uuid();
    }

    $settings = [];
    $settings['components'][$block->bundle()][$rand_id] = $testimonial_block;

    $variables['content']['#attached']['drupalSettings']['asu'] = $settings;
    $variables['content']['#attached']['library'][] = 'asu_react_core/testimonial-on-image-background';
  }
}
//testimonial_on_image_background
