<?php

namespace Drupal\webspark_webdir;

/**
 * Prepares URLs for API calls to the Web Directory REST API.
 */
class WebdirApiUrl {
  protected $settings;

  public function __construct()
  {
    $this->settings = \Drupal::config('webspark_webdir.settings');
  }

  /**
   * Returns base API URL with API version.
   */
  public function getUrlBase()
  {
    return trim($this->settings->get('api'), '/') . '/' .
      trim($this->settings->get('api_version'), '/') . '/';
  }
}
