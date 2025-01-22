<?php

namespace Drupal\asu_react_core;

class ReactComponentCarouselImage implements ReactComponent {

  public function buildSettings(&$variables) {
    $block = $variables['content']['#block_content'];
    $rand_id = random_int(0, PHP_INT_MAX);
    $variables['content']['#prefix'] = '<div id="imageCarouselContainer' . $rand_id   . '" class="image-carousel-containerr"></div>';

    $variables['attributes']['class'][] = 'asu-image-carousel-container';
    $variables['attributes']['id'] = 'asu-image-carousel-container-' . $rand_id;

    $settings = \Drupal::service('asu_react_core.helper_functions')->getImagesItems($block, $rand_id);
    $variables['content']['#attached']['drupalSettings']['asu'] = $settings;
    $variables['content']['#attached']['library'][] = 'asu_react_core/image-carousel';
  }
}
