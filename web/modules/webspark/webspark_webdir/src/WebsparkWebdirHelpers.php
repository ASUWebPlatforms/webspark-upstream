<?php

namespace Drupal\webspark_webdir;

/**
 * Class WebsparkWebdirHelpers.php.
 */
class WebsparkWebdirHelpers
{

  public function getAppPathFolder($component_name)
  {
    $module_handler = \Drupal::service('module_handler');
    $path_module = $module_handler->getModule('webspark_webdir')->getPath();
    $appPathFolder = base_path() . $path_module . '/node_modules/@asu/' . $component_name . '/dist';
    return $appPathFolder;
  }
}
