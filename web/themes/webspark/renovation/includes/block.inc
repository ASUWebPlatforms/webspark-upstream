<?php
/**
 * @file
 * Theme and preprocess functions for blocks.
 */

use Drupal\block_content\Entity\BlockContent;
use Drupal\paragraphs\Entity\Paragraph;
use Drupal\file\Entity\File;
use Drupal\media\Entity\Media;
use Drupal\Core\Link;
use Drupal\Core\Url;
use Drupal\crop\Entity\Crop;
use Drupal\image\Entity\ImageStyle;

/**
 * Implements hook_preprocess_HOOK().
 */
function renovation_preprocess_block(&$variables) {

  $block_id = $variables['derivative_plugin_id'];

  // Per WS2-1215 - Add video hero heading bg color
  // And custom (reusable) hero blocks, too. See WS2-1550
  if (
    ($block_id == 'hero')
    || ($block_id == 'video_hero')
    || (isset($variables['bundle']) && $variables['bundle'] == 'hero')
  ) {
    // Get the key of the selected value from the background color field.
    /** @var Drupal\block_content\ $block_content */
    $block_content = $variables['content']['#block_content'];
    $variables['heading_background_color'] = $block_content->field_hero_background_color->value;
  }

  $plugin_id = $variables['base_plugin_id'] ?? '';

  // WS2-1437 - Add variables to block-content blocks for unique_id
  if (($plugin_id == 'inline_block') || ($plugin_id == 'block_content')) {
    $variables['block'] = $variables['content']['#block_content'];
  }

  // Preprocess tabs for tabbed content.
  if ($block_id == 'tabbed_content') {
    $block_content = $variables['content']['#block_content'];
    $paragraphs = $block_content->field_tab->referencedEntities();

    // Create an array of tabs.
    $tabs = [];
    foreach ($paragraphs as $paragraph) {
      $tabs[] = [
        'heading' => $paragraph->get('field_heading')->value,
        'copy' => $paragraph->get('field_body')->view(),
        'blocks' => $paragraph->get('field_blocks')->view(),
      ];
    }
    $variables['tabs'] = $tabs;
  }

}

/**
 * Gets the video poster image if set.
 *
 * @param array $variables
 *    The block variables.
 *
 * @return string
 *    The Poster image URL, empty string if not found.
 */
function getPosterImage(array $variables): string {
  if (!$variables['content']['#block_content'] instanceof BlockContent) {
    return '';
  }

  /** @var \Drupal\block_content\Entity\BlockContent $block */
  $block = $variables['content']['#block_content'];

  if (!$block->hasField('field_background_image')) {
    return '';
  }

  $poster_entity = $block->get('field_background_image')->referencedEntities();

  if (empty($poster_entity)) {
    return '';
  }

  $poster_media = reset($poster_entity);

  /** @var \Drupal\media\Entity\Media $poster_media */
  if (!($poster_media instanceof Media) || $poster_media->hasField('field_media_image') === FALSE) {
    return '';
  }

  $poster_image = $poster_media->get('field_media_image')->referencedEntities();
  if (empty($poster_image)) {
    return '';
  }

  /** @var \Drupal\file\Entity\File $poster_image */
  $poster_image = reset($poster_image);

  $poster_url = NULL;
  if (Crop::cropExists($poster_image->getFileUri(), 'mobile_video_poster')) {
    $style = ImageStyle::load('video_poster_image');
    if ($style) {
      $poster_url = $style->buildUrl($poster_image->getFileUri());
    }
  }
  else {
    // There is no crop - get image file URL.
    $poster_url = \Drupal::service('file_url_generator')
      ->generateAbsoluteString($poster_image->getFileUri());
  }

  return $poster_url;
}

/**
 * Implements hook_preprocess_HOOK().
 */
function renovation_preprocess_block__inline_block__video_hero(&$variables) {
    $variables['poster'] = getPosterImage($variables);
}
