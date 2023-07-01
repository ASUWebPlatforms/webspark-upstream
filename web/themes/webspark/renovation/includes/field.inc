<?php
/**
 * @file
 * Theme and preprocess functions for fields.
 */
/**
 * Implements hook_preprocess_HOOK().
 */

use Drupal\Core\Url;

function renovation_preprocess_field(&$variables) {

  $field_name = $variables['element']['#field_name'];
  $container = $variables['element']['#object'];
  $block_type = $container->bundle();

  // Field CTAs on banner.
  if ($field_name == 'field_ctas' || $field_name == 'field_cta') {
    // Get background.
    $background_color = getBackgroundColor($container);
    // Get heading
    $section_heading = getSectionHeader($container);
    // Get the paragraph.
    $buttons = [];
    $paragraphs = $variables['items'];

    foreach ( $paragraphs as $paragraph) {
      /** @var  \Drupal\paragraphs\Entity\Paragraph */
      $paragraph_values = $paragraph['content']['#paragraph'];
      if ($paragraph_values->hasField('field_cta_link') && !$paragraph_values->get('field_cta_link')->isEmpty()) {
        // Get the CTA.
        $cta = $paragraph_values->get('field_cta_link')->getValue()[0];
        // Get the icon.
        $icon = get_icon($paragraph_values);

        $buttons[] = [
          'background_color' => $background_color,
          'link' => Url::fromUri($cta['uri']),
          'title' => $cta['title'],
          'color' => isset($cta['options']['attributes']['class']) ? $cta['options']['attributes']['class'] : '',
          'icon' => $icon ? $icon : '',
          'target' => isset($cta['options']['attributes']['target']) ? $cta['options']['attributes']['target'] : '',
          'heading' => $section_heading,
        ];
      }
    }
    $variables['buttons'] = $buttons;
  }

  // Background color field.
  if ($field_name == 'field_banner_background_color') {
    $variables['background_class'] = $container->get('field_banner_background_color')->value;
  }

  // Cards.
  if ($field_name == 'field_cards') {

    if (isset($variables['element']['#view_mode'])) {
      $variables['view_mode'] = $variables['element']['#view_mode'];
    }
  }
}

/**

 * @param \Drupal\paragraphs\Entity\Paragraph $paragraph_values
 *
 * @return mixed|null
 */
function get_icon(\Drupal\paragraphs\Entity\Paragraph $paragraph_values) {
  if ($paragraph_values->hasField('field_icon') && !$paragraph_values->get('field_icon')->isEmpty()) {
    return $paragraph_values->get('field_icon')->getValue()[0]['icon_name'];
  }
  else {
    return null;
  }
}

function getBackgroundColor($container) {
  if ($container->hasField('field_banner_background_color') && !$container->get('field_banner_background_color')->isEmpty()) {
    return $container->get('field_banner_background_color')->value;
  }
  else {
    return null;
  }
}

function getSectionHeader($container) {
  if ($container->hasField('field_heading') && !$container->get('field_heading')->isEmpty()) {
    return $container->get('field_heading')->value;
  }
  else {
    return null;
  }
}

/**
 * Implements hook_theme_suggestions_alter().
 */
function renovation_theme_suggestions_field_alter(&$suggestions, $variables) {
  $suggestions[] = 'field__' .
    $variables['element']['#field_name'] . '__' .
    $variables['element']['#view_mode'];
}

