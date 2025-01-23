<?php

namespace Drupal\asu_react_core\Utils;

use Drupal\Core\Url;
use Drupal\image\Entity\ImageStyle;
use Drupal\crop\Entity\Crop;

/**
 * Class ReactComponentHelperFunctionss.
 */
class ReactComponentHelperFunctions {

  public function getImagesItems($block, $rand_id) {
    $image_carousel = new \stdClass();
    $image_carousel->items = [];

    if ($block->field_type) {
      $image_carousel->type = $block->field_type->value;
    }

    foreach ($block->field_carousel_card as $paragraph_ref) {
      $image_carousel->items[] = $paragraph_ref->entity->uuid();
    }

    $settings = [];
    $settings['components'][$block->bundle()][$rand_id] = $image_carousel;

    return $settings;
  }

  public function getCardContent($paragraph) {
    if (empty($paragraph)) {
      return;
    }
    $id = $paragraph->uuid();
    $card = new \stdClass();
    $card->id = $id;

    switch ($paragraph->getType()) {
      case 'card':
      case 'card_with_icon':
        $card->cardType = 'default';
        break;
      case 'card_degree':
        $card->cardType = 'degree';
        break;
      case 'card_event':
        $card->cardType = 'event';
        break;
      case 'card_story':
        $card->cardType = 'story';
        break;
      case 'card_ranking':
        $card->cardType = 'ranking';
        break;
      case 'image_based_card':
        $card->cardType = 'image';
        break;
    }

    if ($paragraph->field_media && $paragraph->field_media->target_id && $paragraph->field_media->entity->field_media_image->target_id) {
      $uri = $paragraph->field_media->entity->field_media_image->entity->getFileUri();

      $image_source = NULL;
      if (Crop::cropExists($uri, 'images_block')) {
        $style = ImageStyle::load('block_image_med');
        if ($style) {
          $image_source = $style->buildUrl($uri);
        }
      }

      if (!$image_source) {
        $style = ImageStyle::load('image');
        $image_source = $style->buildUrl($uri);
      }

      $card->imageSource = $image_source;
      $card->imageAltText = $paragraph->field_media->entity->field_media_image->alt;
    }
    if ($paragraph->hasField('field_heading') && $paragraph->field_heading->value) {
      $card->title = $paragraph->field_heading->value;
    }
    if ($paragraph->hasField('field_body') && $paragraph->field_body->value) {
      $card->content = $paragraph->field_body->value;
    }
    if ($paragraph->field_cta && $paragraph->field_cta->entity) {
      $cta = new \stdClass();
      $cta->label = $paragraph->field_cta->entity->field_cta_link->title;
      $cta->href = $this->processLink($paragraph->field_cta->entity->field_cta_link->uri);
      $options = $paragraph->field_cta->entity->field_cta_link->options;
      $color = $this->getButtonColor($options,'maroon' );
      if (isset($options['attributes']['target'])) {
        $cta->target = $options['attributes']['target'];
      }
      $cta->color = $color;
      $cta->size = 'default';
      $card->buttons[] = $cta;
    }
    if ($paragraph->field_cta_secondary && $paragraph->field_cta_secondary->entity) {
      $cta = new \stdClass();
      $cta->label = $paragraph->field_cta_secondary->entity->field_cta_link->title;
      $cta->href = $this->processLink($paragraph->field_cta_secondary->entity->field_cta_link->uri);
      $options = $paragraph->field_cta_secondary->entity->field_cta_link->options;
      $color = $this->getButtonColor($options,'gold' );
      if (isset($options['attributes']['target'])) {
        $cta->target = $options['attributes']['target'];
      }
      $cta->color = $color;
      $cta->size = 'small';
      $card->buttons[] = $cta;
    }
    // Field link URL with title and URL
    if ($paragraph->field_link && $paragraph->field_link->title && $paragraph->field_link->uri) {
      $card->linkLabel = $paragraph->field_link->title;
      $card->linkUrl = $this->processLink($paragraph->field_link->uri);
    }

    // WS2-1674 - Card ranking image size.
    if (isset($paragraph->field_card_ranking_image_size->value)) {
      if ($paragraph->field_card_ranking_image_size->value === 'small') {
        $card->imageSize = 'small';
        $card->citation = $paragraph->field_citation_title->value;
      } elseif ($paragraph->field_card_ranking_image_size->value === 'large') {
        $card->imageSize = 'large';
      }
    }

    // WS2-1674 - Card ranking link URL, no link title
    if (isset($paragraph->field_card_ranking_image_size->value) && isset($paragraph->field_link->uri)) {
      $link = Url::fromUri($paragraph->field_link->uri);
      $card->linkUrl = $this->processLink($paragraph->field_link->uri);
    }

    //@TODO We are not going to send this information to the react component,
    // since the functionality in webspark for the tags has not yet been defined
    /*if (!empty($paragraph->field_tags)) {
      foreach ($paragraph->field_tags as $term) {
        $tag = new \stdClass();
        $tag->label = $term->entity->name->value;
        $link = Url::fromRoute('entity.taxonomy_term.canonical', ['taxonomy_term' => $term->entity->tid->value]);
        $tag->href = $link->toString();
        $card->tags[] = $tag;
      }
    }*/

    // WS2-1643 - Adding validating to set icon setting only when it exists.
    if (isset($paragraph->field_icon->icon_name)) {
      $icon_name = $paragraph->field_icon->icon_name;
      $icon_style = $paragraph->field_icon->style;
      if (isset($paragraph->field_icon->settings)) {
        // PHP 8.1 warning - when null is passed to build in function,
        // it is no longer silently converted to empty string
        $icon_settings = unserialize($paragraph->field_icon->settings);
      } else {
        $icon_settings = '';
      }
      $card->icon = [$icon_style, $icon_name, $icon_settings];
    }

    $card->clickable = false;
    if (isset($paragraph->field_clickable->value) && isset($paragraph->field_card_link->uri)){
      $card->clickable = true;
      $link = Url::fromUri($paragraph->field_card_link->uri);
      $card->clickHref = $this->processLink($paragraph->field_card_link->uri);
    }

    $card->showBorders = false;
    if ($paragraph->field_show_borders && $paragraph->field_show_borders->value) {
      $card->showBorders = true;
    }

    // WS2-1711 - Image based card
    if (isset($paragraph->field_loading->value)) {
      $card->loading = $paragraph->field_loading->value;
    }
    if (isset($paragraph->field_caption->value)) {
      $card->caption = $paragraph->field_caption->value;
    }
    if (isset($paragraph->field_caption_title->value)) {
      $card->captionTitle = $paragraph->field_caption_title->value;
    }
    if (isset($paragraph->field_drop_shadow->value) && $paragraph->field_drop_shadow->value) {
      $card->dropShadow = true;
    }

    $settings = [];
    $settings['components']['card'][$id] = $card;

    return $settings;
  }

  function getButtonColor($options, $default) {
    $color = $default;
    if (isset($options['attributes']['class'])) {
      //class structure from custom widget 'btn-size btn-color btn'
      $class = explode( ' ', $options['attributes']['class']);
      $color = substr($class[1], 4);
    }
    return $color;
  }

  function processLink($raw_link) {
    if (isset($raw_link)) {
      if (preg_match('/^https?:\/\//', $raw_link)) {
        return $raw_link;
      }
      // Drupal prepends internal links with 'internal:' so we need to strip it.
      else if (str_starts_with($raw_link, 'internal:')) {
        $raw_link = preg_replace('/internal:/', '', $raw_link);
        $link = Url::fromUserInput($raw_link);
        return $link->toString() ?: $raw_link;
      }
      else if (str_starts_with($raw_link, 'route:') || str_starts_with($raw_link, 'entity:') || str_starts_with($raw_link, 'base:')) {
        $link = Url::fromUri($raw_link);
        return $link->toString() ?: '';
      }
    }
    return NULL;
  }
}
