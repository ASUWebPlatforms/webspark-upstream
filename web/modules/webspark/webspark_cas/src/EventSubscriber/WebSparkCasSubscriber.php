<?php

namespace Drupal\webspark_cas\EventSubscriber;

use Drupal\cas\Subscriber\CasGatewayAuthSubscriber;
use Drupal\Core\Site\Settings;
use Symfony\Component\HttpKernel\Event\RequestEvent;

/**
 * WebSpark CAS event subscriber.
 */
class WebSparkCasSubscriber extends CasGatewayAuthSubscriber {

  /**
   * {@inheritdoc}
   */
  public function onRequest(RequestEvent $event) {
    if ($this->isElasticCrawlerRequest()) {
      return;
    }

    return parent::onRequest($event);
  }

  /**
   * Checks if it is Elastic Crawler request.
   *
   * @return bool
   *   The check result.
   */
  protected function isElasticCrawlerRequest(): bool {
    $requestStack = \Drupal::service('request_stack');
    $current_request = $requestStack->getCurrentRequest();

    $defaultPattern = '/^Elastic-Crawler .*$/';

    // Get the regex from $settings if available.
    $elasticPattern = Settings::get('webspark_cas_elastic_crawler_regex', $defaultPattern);

    $agent = $current_request->server->get('HTTP_USER_AGENT');
    if (empty($agent)) {
      return FALSE;
    }

    if (\preg_match($elasticPattern, $agent)) {
      // Allow the Elastic crawler.
      return TRUE;
    }

    return FALSE;
  }

}
