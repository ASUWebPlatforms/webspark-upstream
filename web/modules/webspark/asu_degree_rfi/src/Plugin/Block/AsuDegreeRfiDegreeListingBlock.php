<?php

namespace Drupal\asu_degree_rfi\Plugin\Block;

use Drupal\node\NodeInterface;
use Drupal\Core\Block\BlockBase;
use Drupal\Core\Cache\Cache;

/**
 * ASU Degree RFI module Degree listing component block.
 *
 * @Block(
 *   id = "asu_degree_rfi_degree_listing_block",
 *   admin_label = @Translation("Degree listing component"),
 * )
 */
class AsuDegreeRfiDegreeListingBlock extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function getCacheTags() {
    // Default block caching works for now. Cache is invalidated when
    // node is updated and that fits our use-case.
    // Define cache tag.
    // Gets invalidated when ... TBD
    return Cache::mergeTags(parent::getCacheTags(), array('degree_listing_block_cache'));
  }

  /**
   * {@inheritdoc}
   */
  public function build() {

    // Degree component blocks are deployed as 1 block to 1 content type. I.e.
    // the Degree listing block is attached to the Degree listing content type,
    // and similarly for the Degree details page and block. This works and still
    // allows for customization/overrides for degree components because the
    // configurations and override values used as the components' props are
    // defined on the node, but pulled in via the block.

    // Pass data from php:
    // https://codimth.com/blog/web/drupal/passing-data-php-javascript-drupal-8

    // Pull in global configs for module.
    $global_config = \Drupal::config('asu_degree_rfi.settings');

    // Pull in block-level configs (see blockForm()). Drupal manages deltas.
    $config = $this->getConfiguration();

    $props = [];

    $node = \Drupal::routeMatch()->getParameter('node');
    if (!$node) {
      return [];
    }

    if ($node && !($node instanceof NodeInterface || $node->bundle() == 'degree_listing_page')) {
      return [];
    }

    //Default images.
    $props['appPathFolder'] = \Drupal::service('asu_degree_rfi.helper_functions')->getappPathFolder('app-degree-pages');

    $actionUrls = new \stdClass();
    if ($node->field_degree_list_apply_now_url) {
      $actionUrls->applyNowUrl = $node->field_degree_list_apply_now_url->value;
    }

    $program = $node->field_degree_list_program->value;
    $exclude_value = $node->field_exclude_from_display->value;
    $blacklist = isset($exclude_value) ? array_map('trim', explode(",", $exclude_value)) : NULL;
    $certs_minors = $node->field_degree_list_certs_minors->value;
    $certs_minors_str = ($certs_minors) ? 'true' : 'false';
    $base_url = '';
    switch ($program) {
      case 'undergrad':
        if ($certs_minors) {
          $base_url = 'undergraduate-certificates';
        } else {
          $base_url = 'bachelors-degrees';
        }
        break;
      case 'graduate':
        if ($certs_minors) {
          $base_url = 'graduate-certificates';
        } else {
          $base_url = 'masters-degrees-phds';
        }
        break;
    }
    $actionUrls->majorInfoUrl = '/' . $base_url . '/majorinfo/{ACAD_PLAN_CODE}/' . $program . '/' . $certs_minors_str . '/' . $node->id();
    $props['actionUrls'] = $actionUrls;

    //Hero
    $hero = new \stdClass;

    $image = \Drupal::service('asu_degree_rfi.helper_functions')->getImageFieldValue($node->field_degree_list_hero_image);
    if (!empty((array)$image)) {
      $hero->image = $image;
    }
    if ($node->field_degree_list_hero_size->value) {
      if (empty($hero->image)) {
        $hero->image = new \stdClass;
      }
      $hero->image->size = $node->field_degree_list_hero_size->value;
    }
    if ($node->field_degree_list_hero_title->value) {
      $hero->title = new \stdClass;
      $hero->title->text = $node->field_degree_list_hero_title->value;
    }
    if ($node->field_degree_list_hero_highlight->value) {
      if (empty($hero->title)) {
        $hero->title = new \stdClass;
      }
      $hero->title->highlightColor = $node->field_degree_list_hero_highlight->value;
    }
    if (!empty((array)$hero)) {
      $props['hero'] = $hero;
    }

    //Intro content
    $introContent = new \stdClass;

    if ($node->field_degree_list_intro_type->value) {
      $introContent->type = $node->field_degree_list_intro_type->value;
    }
    if ($node->field_degree_list_header->value) {
      $introContent->header = new \stdClass;
      $introContent->header->text = $node->field_degree_list_header->value;
    }

    //Type: text
    if ($node->field_degree_list_intro_title->value) {
      $introContent->title = new \stdClass;
      $introContent->title->text = $node->field_degree_list_intro_title->value;
    }
    if ($node->field_degree_list_intro_content->value) {
      $introContent->contents[] = (object) [
        'text' => $node->field_degree_list_intro_content->value,
      ];
    }
    //Type: photo_grid
    $photoGrid = new \stdClass();
    foreach ($node->field_degree_list_photo_grid as $item) {
      $image = new \stdClass();
      $imageUri = $item->entity->field_media_image->entity->getFileUri();
      $image->url = \Drupal::service('file_url_generator')->generateAbsoluteString($imageUri);
      $image->altText = $item->entity->field_media_image->alt;
      $photoGrid->images[] = $image;
    }
    $introContent->photoGrid = $photoGrid;

    //Type: media
    if ($node->field_degree_listing_intro_media->target_id) {
      $bundle = $node->field_degree_listing_intro_media->entity->bundle();
      switch ($bundle) {
        case 'image':
          $image = \Drupal::service('asu_degree_rfi.helper_functions')->getImageFieldValue($node->field_degree_listing_intro_media);
          if (!empty((array)$image)) {
            $introContent->image = $image;
          }
          break;
        case 'video':
          $video = \Drupal::service('asu_degree_rfi.helper_functions')->getVideoFieldValue($node->field_degree_listing_intro_media);
          if (!empty((array)$video)) {
            $introContent->video = $video;
          }
          break;
      }
    }

    if (!empty((array)$introContent)) {
      $props['introContent'] = $introContent;
    }
    if ($node->field_degree_list_show_filters) {
      $props['hasFilters'] = (bool) $node->field_degree_list_show_filters->value;
    }
    if ($node->field_degree_list_show_search) {
      $props['hasSearchBar'] = (bool) $node->field_degree_list_show_search->value;
    }

    $programList = new \stdClass;

    if ($global_config->get('asu_degree_rfi.program_list_datasource_endpoint')) {
      $programList->dataSource = new \stdClass;
      $programList->dataSource->endpoint = $global_config->get('asu_degree_rfi.program_list_datasource_endpoint');
    }

    if ($node->field_degree_list_hide_colschl->value) {
      $programList->settings = new \stdClass;
      $programList->settings->hideCollegeSchool = (bool) $node->field_degree_list_hide_colschl->value;
    }

    if ($node->field_degree_list_default_view->value) {
      if (empty($programList->settings)) {
        $programList->settings = new \stdClass;
      }
      $programList->settings->defaultView = $node->field_degree_list_default_view->value;
    }

    $card_default_image = \Drupal::service('asu_degree_rfi.helper_functions')
      ->getImageFieldValue($node->field_degree_list_card_image);
    if (!empty((array)$card_default_image)) {
      if (empty($programList->settings)) {
        $programList->settings = new \stdClass;
      }
      $programList->settings->cardDefaultImage = $card_default_image;
    }

    if (empty($programList->dataSource)) {
      $programList->dataSource = new \stdClass;
    }

    $programList->dataSource->program = $program;
    $programList->dataSource->blacklistAcadPlans = $blacklist;
    // Need to set "cert" prop value as a string, per WS2-1602.
    $programList->dataSource->cert = $certs_minors_str;

    if ($node->field_degree_list_college_code->value) {
      $programList->dataSource->collegeAcadOrg = $node->field_degree_list_college_code->value;
    }

    if ($node->field_degree_list_dept_code->value) {
      $programList->dataSource->departmentCode = $node->field_degree_list_dept_code->value;
    }

    if ($node->field_degree_degrees_per_page->value) {
      $props['degreesPerPage'] = (int) $node->field_degree_degrees_per_page->value;
    }
    $props['programList'] = $programList;

    $block_output = [];

    // Markup containers where components will initialize.
    $block_output['#markup'] =
      $this->t('
      <!-- ListingPage component will be initialized in this container. -->
      <div id="degreeListingPageContainer"></div>
      ');
    // Attach components and helper js registered in asu_degree_rfi.libraries.yml
    $block_output['#attached']['library'][] = 'asu_degree_rfi/degree-listing-page';
    //Pass block configs to javascript. Gets taken up in js/asu_brand.header.js
    $block_output['#attached']['drupalSettings']['asu_degree_rfi']['degree_listing_page'] = $props;

    return $block_output;
  }
}
