<?php

namespace Drupal\asu_degree_rfi;

use Drupal\node\NodeInterface;
use Drupal\Core\Url;

/**
 * Class AsuDegreeRfiHelperFunctions.php.
 */
class AsuDegreeRfiHelperFunctions {

  public function getImageFieldValue($field) {
    $image = new \stdClass();
    if ($field->target_id && $field->entity->field_media_image->target_id) {
      $imageUri = $field->entity->field_media_image->entity->getFileUri();
      $image->url = \Drupal::service('file_url_generator')->generateAbsoluteString($imageUri);
      $image->altText = $field->entity->field_media_image->alt;
    }
    return $image;
  }

  public function getVideoFieldValue($field) {
    $video = new \stdClass();
    if ($field->target_id && $field->entity->field_media_video_file->target_id) {
      $vidUri = $field->entity->field_media_video_file->entity->getFileUri();
      $video->url = \Drupal::service('file_url_generator')->generateAbsoluteString($vidUri);
      $video->altText = $field->entity->field_media_video_file->name;
    }
    return $video;
  }

  public function getRemoteVideoFieldValue($field) {
    $video = new \stdClass();
    if ($field->entity && $field->entity->field_media_oembed_video->value) {
      $video->url = $field->entity->field_media_oembed_video->value;
      $video->type = 'youtube';
    }
    return $video;
  }

  public function getParagraphsContent($paragraph, $field = "nextSteps") {
    if (empty($paragraph)) {
      return;
    }
    $card = new \stdClass();

    // shared fields
    if ($paragraph->field_degree_nxtsteps_card_title->value) {
      $card->title = $paragraph->field_degree_nxtsteps_card_title->value;
    }
    // Partially shared fields
    switch ($field) {
      case "whyChooseAsu":
        // whyChooseAsu - top image
        $image = new \stdClass();
        if (isset($paragraph->field_card_top_image->target_id)) {
          $wca_image = $paragraph->field_card_top_image->entity;
          $image->altText = $wca_image->field_media_image->alt;
          $imageUri = $wca_image->field_media_image->entity->getFileUri();
          $image->url = \Drupal::service('file_url_generator')->generateAbsoluteString($imageUri);
          $card->image = $image;
        }
        // Varying props names?
        $content = "text";
        $button = "button";
        break;
      default: // nextSteps
        $content = "content";
        $button = "buttonLink";
        //// nextSteps top icon
        if (isset($paragraph->field_degree_nxtsteps_card_icon) && $paragraph->field_degree_nxtsteps_card_icon->icon_name) {
          $icon_name = $paragraph->field_degree_nxtsteps_card_icon->icon_name;
          $icon_style = $paragraph->field_degree_nxtsteps_card_icon->style;
          $card->icon = [$icon_style, $icon_name];
        }
        break;
    }
    if ($paragraph->field_degree_nxtstep_card_contnt->value) {
      $card->{$content} = $paragraph->field_degree_nxtstep_card_contnt->value;
    }
    $buttonLink = new \stdClass();
    if ($paragraph->field_degree_nxtsteps_card_btn && $paragraph->field_degree_nxtsteps_card_btn->title && $paragraph->field_degree_nxtsteps_card_btn->uri) {
      $buttonLink->label = $paragraph->field_degree_nxtsteps_card_btn->title;
      $link = Url::fromUri($paragraph->field_degree_nxtsteps_card_btn->uri);
      $buttonLink->href = $link->toString();
      $buttonLink->color = ($paragraph->field_degree_nxtsteps_btn_color->value) ?? "maroon";
    }
    if (!empty((array)$buttonLink)) {
      $card->{$button} = $buttonLink;
    }
    return $card;
  }

  public function getappPathFolder($component_name) {
    $module_handler = \Drupal::service('module_handler');
    $path_module = $module_handler->getModule('asu_degree_rfi')->getPath();
    $appPathFolder = base_path() . $path_module . '/node_modules/@asu/' . $component_name . '/dist';
    return $appPathFolder;
  }

  public function getRouteProgramOfInterest() {
    $route_node = \Drupal::routeMatch()->getParameter('node');
    $route_pgm_of_interest = null;
    if ($route_node instanceof NodeInterface && $route_node->bundle() === 'degree_detail_page') {
      $route_pgm_of_interest = $route_node->get('field_degree_detail_acadplancode')->getvalue()[0]['value'];
    }
    return $route_pgm_of_interest;
  }
}
