<?php

namespace Drupal\asu_react_core;

class ReactComponentImageGallery implements ReactComponent {

  public function buildSettings(&$variables) {
    $block = $variables['content']['#block_content'];
    $rand_id = random_int(0, PHP_INT_MAX);
    $variables['content']['#prefix'] = '<div id="imageGalleryCarouselContainer' . $rand_id   . '" class="image-carousel-containerr"></div>';

    $variables['attributes']['class'][] = 'asu-gallery-carousel-container';
    $variables['attributes']['id'] = 'asu-gallery-carousel-container-' . $rand_id;

    $settings = \Drupal::service('asu_react_core.helper_functions')->getImagesItems($block, $rand_id);;
    $variables['content']['#attached']['drupalSettings']['asu'] = $settings;
    $variables['content']['#attached']['library'][] = 'asu_react_core/image_gallery_carousel';
  }
}
