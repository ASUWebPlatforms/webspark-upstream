<?php

namespace Drupal\asu_events\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * An example controller.
 */
class AsuEventsController extends ControllerBase {

  /**
   * Returns a render-able array.
   */
  public function content($filter) {
    $result = '';
    $client = \Drupal::httpClient();
    try {
      $config = \Drupal::config('asu_events.settings');
      $feed_url = $config->get('asu_events_feed_url');
      $url = $feed_url . $filter;
      $request = $client->get($url);
      $code = $request->getStatusCode();
      if ($code == 200) {
        $content = $request->getBody()->getContents();
        $file_contents = json_decode($content);
        $result = new JsonResponse($file_contents);
      }
    }
    catch (\Exception $e) {
      \Drupal::logger('asu_events')->error($e->getMessage());
    }
    return $result;
  }

}
