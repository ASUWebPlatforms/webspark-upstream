<?php
namespace Drupal\asu_degree_rfi\Routing;

use Drupal\Core\Routing\RouteSubscriberBase;
use Symfony\Component\Routing\RouteCollection;

class RouteSubscriber extends RouteSubscriberBase {
  protected function alterRoutes(RouteCollection $collection) {
    if ($route = $collection->get('system.404')) {
      $route->setDefault('_controller', '\Drupal\asu_degree_rfi\Controller\AsuDegreePagesCreation::load');
    }
  }
}