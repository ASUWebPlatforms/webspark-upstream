<?php

namespace Drupal\webspark_cas\EventSubscriber;

use Symfony\Component\HttpKernel\Event\RequestEvent;
use Drupal\cas\Subscriber\CasRouteSubscriber;
use Drupal\Core\Site\Settings;

/**
 * WebSpark CAS event subscriber.
 */
class WebSparkCasSubscriber extends CasRouteSubscriber {

  /**
   * {@inheritdoc}
   */
  public function handle(RequestEvent $event) {
    if ($this->isElasticCrawlerRequest() && !$this->isForcedPath()) {
      return;
    }

    return parent::handle($event);
  }

  /**
   * Checks if it is Elastic Crawler request.
   *
   * @return bool
   *   The check result.
   */
  protected function isElasticCrawlerRequest(): bool {
    $current_request = $this->requestStack->getCurrentRequest();

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

  /**
   * Checks if the path is a forced login one.
   *
   * @see https://stackoverflow.com/a/61921662
   *
   * @return bool
   *   The check result.
   */
  protected function isForcedPath() {
    $r = new \ReflectionMethod(parent::class, 'handleForcedPath');
    $r->setAccessible(TRUE);
    return $r->invoke($this);
  }

}
