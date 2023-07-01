<?php

/**
 * Implements hook_preprocess_HOOK().
 */
function renovation_preprocess_paragraph(&$variables) {
  /* @var \Drupal\paragraphs\Entity\Paragraph */
  $paragraph = $variables['elements']['#paragraph'];
  $bundle = $paragraph->getType();
  $parent = $paragraph->getParentEntity();
  $variables['parent_id'] = $parent ? $parent->id() : '';

  // CTA Paragraph.
  if ($bundle == 'cta') {
    // Set button type to default or icon.
    if ($paragraph->get('field_icon')->isEmpty()) {
      $variables['has_icon'] = FALSE;
    }
    else {
      $variables['has_icon'] = TRUE;
    }
  }
  // CTAs paragraph.
  if ($bundle == 'cta') {
    $variables['button_action'] = TRUE;
  }

}
