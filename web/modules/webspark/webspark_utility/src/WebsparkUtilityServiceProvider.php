<?php

namespace Drupal\webspark_utility;

use Drupal\Core\DependencyInjection\ContainerBuilder;
use Drupal\Core\DependencyInjection\ServiceProviderBase;

/**
 * Modifies the config_readonly_form_subscriber service.
 */
class WebsparkUtilityServiceProvider extends ServiceProviderBase {

  /**
   * {@inheritdoc}
   */
  public function alter(ContainerBuilder $container) {
    // Overrides config_readonly_form_subscriber class.
    if ($container->hasDefinition('config_readonly_form_subscriber')) {
      $definition = $container->getDefinition('config_readonly_form_subscriber');
      $definition->setClass('Drupal\webspark_utility\EventSubscriber\ReadOnlyFormSubscriber');
    }
  }
}