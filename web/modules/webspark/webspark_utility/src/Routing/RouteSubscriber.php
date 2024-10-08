<?php

namespace Drupal\webspark_utility\Routing;

use Drupal\Core\Routing\RouteSubscriberBase;
use Symfony\Component\Routing\RouteCollection;

class RouteSubscriber extends RouteSubscriberBase {
  /**
   * {@inheritdoc}
   */
  protected function alterRoutes(RouteCollection $collection) {
    // Always deny access to '/admin/modules/install'
    if ($route = $collection->get('update.module_install')) {
      // Note that the second parameter of setRequirement() is a string, not a boolean
      $route->setRequirement('_access', 'FALSE');
    }
  }
}
