<?php


namespace Drupal\asu_react_core;


class ComponentFactory {

  /**
   * @param string $id
   * @return ReactComponent
   */
  static public function load(string $id) {
    $types = [
      'card_and_image' => '\Drupal\asu_react_core\ReactComponentCardAndImage',
      'card_image_and_content' => '\Drupal\asu_react_core\ReactComponentCardAndImage',
      'testimonial' => '\Drupal\asu_react_core\ReactComponentTestimonial',
      'card_arrangement' => '\Drupal\asu_react_core\ReactComponentCardArrangement',
      'card_carousel' => '\Drupal\asu_react_core\ReactComponentCardCarousel',
      'testimonial_carousel' => '\Drupal\asu_react_core\ReactComponentTestimonialCarousel',
      'carousel_image' => '\Drupal\asu_react_core\ReactComponentCarouselImage',
      'gallery' => '\Drupal\asu_react_core\ReactComponentImageGallery',
      'testimonial_on_image_background' => '\Drupal\asu_react_core\ReactComponentTestimonialOnImageBackground'
    ];

    if (!in_array($id, array_keys($types))) {
      return;
    }

    $classname = $types[$id];
    if ($classname) {
      return new $classname();
    }
  }
}
