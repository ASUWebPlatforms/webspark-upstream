<?php

namespace Drupal\asu_news\Controller;

use Drupal\Core\Controller\ControllerBase;
use GuzzleHttp\Exception\RequestException;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * An example controller.
 */
class AsuNewsController extends ControllerBase {

  /**
   * Returns a render-able array.
   */
  public function content($filter) {
    $result = '';
    $client = \Drupal::httpClient();
    try {
      $config = \Drupal::config('asu_news.settings');
      $fedd_url = $config->get('asu_news_feed_url');
      $url = $fedd_url . $filter;
      $request = $client->get($url);
      $code = $request->getStatusCode();
      if ($code == 200) {
        $content = $request->getBody()->getContents();
        $file_contents = json_decode($content);
        $result = new JsonResponse($file_contents);
      }
    }
    catch (RequestException $e) {
      \Drupal::logger('asu_news')->error($e->getMessage());
    }
    return $result;
  }

}
