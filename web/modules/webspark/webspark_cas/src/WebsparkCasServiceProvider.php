<?php

namespace Drupal\webspark_cas;

use Drupal\Core\DependencyInjection\ContainerBuilder;
use Drupal\Core\DependencyInjection\ServiceModifierInterface;

/**
 * Modifies the cas.gateway_subscriber service.
 */
class WebsparkCasServiceProvider implements ServiceModifierInterface {

  /**
   * Alters the cas.gateway_subscriber service.
   *
   * See https://drupal.stackexchange.com/questions/288814/is-it-possible-to-override-replace-an-event-subscriber.
   *
   * @param \Drupal\Core\DependencyInjection\ContainerBuilder $container
   *   The container builder.
   */
  public function alter(ContainerBuilder $container) {
    // Overrides cas.gateway_subscriber class.
    if ($container->hasDefinition('cas.gateway_subscriber')) {
      $definition = $container->getDefinition('cas.gateway_subscriber');
      $definition->setClass('Drupal\webspark_cas\EventSubscriber\WebSparkCasSubscriber');
    }
  }

}
