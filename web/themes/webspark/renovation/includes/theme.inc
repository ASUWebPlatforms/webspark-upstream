<?php

/**
 * @file
 * Custom theme hooks.
 */


/**
 * Implements hook_library_info_build().
 * Automatically creates components libraries (Not visible in theme's libraries.yml file)
 * This allows us to add js files/behaviours to components within the components own folder.
 * Note that the component should have the same name as the folder.
 *  {{ attach_library('renovation/block') }}.
 */
function renovation_library_info_build() {
  $extensions = ['css', 'js'];
  $theme_path = \Drupal::service('theme_handler')->getTheme('renovation')->getPath();
  $directory = $theme_path . '/src/components';
  $extensions = array_map('preg_quote', $extensions);
  $extensions = implode('|', $extensions);
  if (!is_dir($directory)) {
    return [];
  }
  $file_scan = \Drupal::service('file_system')->scanDirectory($directory, "/{$extensions}$/");
  $libraries = [];
  foreach ($file_scan as $file) {
    $parts = explode('.', $file->filename);
    $extension = end($parts);
    switch ($extension) {
      case 'css':
        $libraries[$file->name][$extension] = [
          'component' => [
            '/' . $file->uri => [],
          ],
        ];
        break;

      case 'js':
        $libraries[$file->name][$extension] = [
          '/' . $file->uri => [],
        ];
        break;
    }
  }
  return $libraries;
}

/**
 * Preprocess variables for all templates.
 * @param $variables
 */
function renovation_preprocess(&$variables, $hook) {
  // Inject the current language into every template
  $language = \Drupal::languageManager()->getCurrentLanguage()->getId();
  $variables['language'] = $language;

  // Inject the base url into every template
  global $base_url;
  $variables['base_url'] = $base_url;

  // Check if we have an error and add the required asu class.
  // Add new hooks here if they need this class on error.
  if (in_array($hook, ['input', 'textarea', 'select'])) {
    if (isset($variables['element']['#errors']) && $variables['element']['#errors']) {
      $variables['attributes']['class'][] = 'is-invalid';
    }
  }
}

/**
 * Implements hook_theme_suggestions_HOOK_alter().
 */
function renovation_theme_suggestions_image_style_alter(array &$suggestions, array $variables) {
  $suggestions[] = $variables['theme_hook_original'] . '__' . $variables['style_name'];
}

/**
 * Implements hook_theme_suggestions_HOOK_alter().
 */
function renovation_theme_suggestions_image_alter(array &$suggestions, array $variables) {
  $suggestions[] = $variables['theme_hook_original'] . '__' . $variables['style_name'];
}

/**
 * Implements hook_theme_suggestions_HOOK_alter().
 */
function renovation_theme_suggestions_input_alter(array &$suggestions, array $variables) {
  $element = $variables['element'];
  if (isset($element['#name']) && strpos($element['#name'], 'field_banner_background_color') > 0) {
    // Specifically for radio inputs on color selector.
    $suggestions[] = $variables['theme_hook_original'] . '__' . 'field_banner_background_color';
  }
}

/**
 * Implements hook_page_attachments_alter().
 * @param array $page
 */
function renovation_page_attachments_alter(array &$page) {
  // Get the path to the Drupal installation.
  $fragments = explode('/', DRUPAL_ROOT);
  // Remove the last element (web) because we want to go up a level.
  array_pop($fragments);
  // Build the composer path.
  $composer_path = implode('/', $fragments) . '/upstream-configuration/composer.json';
  
  // Get the version number.
  $version = '1.0';
  if (file_exists($composer_path)) {
    $composerJSON = file_get_contents($composer_path);
    $composer_contents = \Drupal\Component\Serialization\Json::decode($composerJSON);
    $version = $composer_contents['version'] ?? '1.0';
  }
  
  $tag = array(
    '#tag' => 'meta',
    '#attributes' => array(
      'name' => 'cmsversion',
      'http-equiv' => 'X-Name-of-Distro',
      'content' => 'Webspark2:' . $version,
    ),
  );
  
  $page['#attached']['html_head'][] = [$tag, 'tagname'];
}

/**
 * Implements hook_preprocess_media().
 */
function renovation_preprocess_media(array &$variables) {
  if ($variables['elements']['#media']->bundle() == 'image') {
    $attributes = &$variables['attributes'];
    $spacing_fields = ['data-spacing-bottom', 'data-spacing-top', 'data-spacing-right', 'data-spacing-left'];

    foreach ($spacing_fields as $spacing_field) {
      if (!empty($attributes[$spacing_field])) {
        $attributes['class'][] = $attributes[$spacing_field];
      }

      unset($attributes[$spacing_field]);
    }

    if (!empty($attributes['data-round'])) {
      $attributes['class'][] = 'rounded-circle';
    }
    unset($attributes['data-round']);
  }
}


/**
 * Implements hook_preprocess_maintenance_page().
 */

function renovation_preprocess_maintenance_page(&$variables) {

  $block_manager = \Drupal::service('plugin.manager.block');
  
  // Building header block and props, no navtree

  $header_block = \Drupal\block\Entity\Block::load('asubrandheader');

  // AsuBrandHeaderBlock

  if ($header_block) {
    $settings = $header_block->get('settings');
    $header_built = $block_manager->createInstance('asubrandheader', $settings);
    // Some blocks might implement access check.
    $header_render =  $header_built->build();
    // Add the cache tags/contexts.
    \Drupal::service('renderer')->addCacheableDependency($header_render, $header_built);  

    $header_config = $header_block->get('settings');

    //  @todo Create a service to return props for a block based on block settings.
    //   For now recreating the props object for the header block here in a semi-hardcoded way.

    $props = [];
    $props['baseUrl'] = $header_config['asu_brand_header_block_base_url'] ?? 'https://asu.edu';
    $props['title'] = $header_config['asu_brand_header_block_title'];
    $props['parentOrg'] = $header_config['asu_brand_header_block_parent_org'];
    $props['parentOrgUrl'] = $header_config['asu_brand_header_block_parent_org_url'];
    $props['expandOnHover'] = $header_config['asu_brand_header_block_expand_on_hover'];
    $props['loginLink'] = $header_config['asu_brand_header_block_login_path'];
    $props['logoutLink'] = $header_config['asu_brand_header_block_logout_path'];
    $props['searchUrl'] = "https://search.asu.edu/search";
    $props['navTree'] = null;
    $props['loggedIn'] = FALSE;
    $props['userName'] = '';

    $variables['heading'] =  t("Site under maintenance");
    $variables['#attached']['drupalSettings']['asu_brand'] = $header_config;
    $variables['#attached']['drupalSettings']['asu_brand']['props'] = $props;
    $variables['#attached']['library'][] = 'asu_react_core/react-core';
    $variables['#attached']['library'][] = 'asu_brand/components-library';
  }

  // Building footer block

  // Hard-coding footer block default configuration to avoid hitting database on maintenance page
  $config = [
    "label" => 'ASU footer',
    "label_display" => '0',
    "provider" => 'asu_footer',
    "asu_footer_block_unit_logo" => null,
    "asu_footer_block_unit_name" =>  '',
    "asu_footer_block_show_logo_social_media" =>  0,
    "asu_footer_block_facebook_url" =>  '',
    "asu_footer_block_twitter_url" =>  '',
    "asu_footer_block_linkedin_url" =>  '',
    "asu_footer_block_instagram_url" =>  '',
    "asu_footer_block_youtube_url" =>  '',
    "asu_footer_block_show_columns" =>  0,
    "asu_footer_block_link_title" => '',
    "asu_footer_block_link_url" =>  '',
    "asu_footer_block_cta_title" =>  '',
    "asu_footer_block_cta_url" => '',
    "asu_footer_block_second_title" =>  '',
    "asu_footer_block_menu_second_column_name" => '_none',
    "asu_footer_block_third_title" => '',
    "asu_footer_block_menu_third_column_name" => '_none',
    "asu_footer_block_fourth_title" => '',
    "asu_footer_block_menu_fourth_column_name" => '_none',
    "asu_footer_block_fifth_title" =>  '',
    "asu_footer_block_menu_fifth_column_name" =>  '_none',
    "asu_footer_block_sixth_title" => '',
    "asu_footer_block_menu_sixth_column_name" => '_none'
  ];
  $plugin_block = $block_manager->createInstance('asu_footer', $config);
  // Some blocks might implement access check.
  $render = $plugin_block->build();
  // Add the cache tags/contexts.
  \Drupal::service('renderer')->addCacheableDependency($render, $plugin_block);
  // return $render;
  $variables['footer'] =   $render;
}