<?php

namespace Drupal\webspark_utility;

use Drupal\Core\DependencyInjection\ContainerBuilder;
use Drupal\Core\DependencyInjection\ServiceProviderBase;

@trigger_error('The ' . __NAMESPACE__ . '\WebsparkUtilityServiceProvider is deprecated in Webspark 2.15.0.
Instead, use \Drupal\Drupal\asu_config_utility\ASUConfigUtilityServiceProvider.', E_USER_DEPRECATED);

/**
 * @deprecated Deprecated as of Webspark 2.15.0
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
