<?php

namespace Drupal\asu_brand;

use Drupal\Core\Html;

/**
 * Class AsuBrandHelperFunctions.php.
 */
class AsuBrandHelperFunctions {
  /**
   * @return array - Search URL for ASU.edu searches routed to Google, local host name (TLD) for Elastic search results
   */
  public function getSearchHosts() {
    $search_config = \Drupal::config('asu_brand.settings');
    $asu_search_url = $search_config->get('asu_brand.asu_brand_search_url') ?? '';
    // Domain-specific results host
    $local_search_url = $search_config->get('asu_brand.asu_brand_local_search_url') ?? \Drupal::request()->getHost();
    // "opt-out"
    $url_host = ($local_search_url === 'opt-out') ? '' : $local_search_url;
    return ['asu_search_url' => $asu_search_url, 'url_host' => $url_host];
  }

  /**
   * PHP version of encodeURIComponent from Javascript
   * @param $str - Raw string
   * @return string - Encoded string
   */
  public function encodeURIComponent($str): string {
    $revert = array('%21'=>'!', '%2A'=>'*', '%28'=>'(', '%29'=>')');
    return strtr(rawurlencode($str), $revert);
  }
}
