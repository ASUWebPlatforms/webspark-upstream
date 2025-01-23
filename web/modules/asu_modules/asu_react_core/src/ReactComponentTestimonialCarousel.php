<?php

namespace Drupal\asu_react_core;

class ReactComponentTestimonialCarousel implements ReactComponent {

  public function buildSettings(&$variables) {
    $block = $variables['content']['#block_content'];
    $rand_id = random_int(0, PHP_INT_MAX);
    $variables['content']['#prefix'] = '<div id="testimonialCarouselContainer' . $rand_id   . '" class="testimonial-carousel-container"></div>';


    $variables['attributes']['class'][] = 'asu-testimonial-carousel-container';

    $variables['attributes']['id'] = 'asu-testimonial-carousel-container-' . $rand_id;

    $testimonial_carousel = new \stdClass();
    $testimonial_carousel->items = [];
    $testimonial_carousel->style = ['with-image'];
    $testimonial_carousel->itemTitleCssClass = [];

    if ($block->field_text_color->value) {
      $testimonial_carousel->style[] = $block->field_text_color->value;
    }
    if ($block->field_accent_color->value) {
      $testimonial_carousel->style[] = $block->field_accent_color->value;
    }
    if ($block->field_heading_highlight->value) {
      $testimonial_carousel->itemTitleCssClass[] = $block->field_heading_highlight->value;
    }

    $block->field_testimonial->getValue();

    foreach ($block->field_testimonial as $paragraph_ref) {
      $testimonial_carousel->items[] = $paragraph_ref->entity->uuid();
    }

    $settings = [];
    $settings['components'][$block->bundle()][$rand_id] = $testimonial_carousel;

    $variables['content']['#attached']['drupalSettings']['asu'] = $settings;
    $variables['content']['#attached']['library'][] = 'asu_react_core/testimonial-carousel';
  }
}
