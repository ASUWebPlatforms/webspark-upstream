<?php

namespace Drupal\webspark_utility;

use Drupal\Core\Config\StorageInterface;
use Drupal\config_update\ConfigReverter;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Extension\ExtensionDiscovery;
use Drupal\Core\Entity\Exception\FieldStorageDefinitionUpdateForbiddenException;
use Drupal\Core\Config\ConfigFactoryInterface;

/**
 * Description of WebsparkUtilityConfigManager
 *
 * @author ovidiu
 */
class WebsparkUtilityConfigManager {

  /**
   * The entity manager.
   *
   * @var \Drupal\Core\Entity\EntityManagerInterface
   */
  protected $entityManager;

  /**
   * The active configuration storage.
   *
   * @var \Drupal\Core\Config\StorageInterface
   */
  protected $activeConfigStorage;

  /**
   * The extension configuration storage for config/install config items.
   *
   * @var \Drupal\Core\Config\StorageInterface
   */
  protected $extensionConfigStorage;

  /**
   * The configuration reverter.
   *
   * @var \Drupal\config_update\ConfigReverter
   */
  protected $configReverter;


  /**
   * The module handler.
   *
   * @var \Drupal\Core\Extension\ModuleHandlerInterface
   */
  protected $moduleHandler;

  /**
   * The config factory interface.
   *
   * @var \Drupal\Core\Config\ConfigFactoryInterface
   */
  protected $configFactory;

  /**
   * Constructs a WebsparkUtilityConfigManager.
   *
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_manager
   *   The entity manager.
   * @param \Drupal\Core\Config\StorageInterface $active_config_storage
   *   The active config storage.
   * @param \Drupal\Core\Config\StorageInterface $extension_config_storage
   *   The extension config storage.
   * @param \Drupal\config_update\ConfigReverter $config_reverter
   *   The Configuration reverter.
   * @param \Drupal\Core\Extension\ModuleHandlerInterface $module_handler
   *   The module handler.
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
   *   The config factory.
   */
  public function __construct(EntityTypeManagerInterface $entity_manager, StorageInterface $active_config_storage, StorageInterface $extension_config_storage, ConfigReverter $config_reverter, ModuleHandlerInterface $module_handler, ConfigFactoryInterface $config_factory) {
    $this->entityManager = $entity_manager;
    $this->activeConfigStorage = $active_config_storage;
    $this->extensionConfigStorage = $extension_config_storage;
    $this->configReverter = $config_reverter;
    $this->moduleHandler = $module_handler;
    $this->configFactory = $config_factory;
  }

  /**
   * Revert/insert all the configuration files of a module.
   * @param string $module
   * @throws Exception
   */
  public function revertAll($module) {

    // Get all the configs.
    $data = $this->getModuleConfigs($module);
    // Import the new configurations first.
    foreach ($data['new'] as $type => $items) {
      foreach ($items as $name) {
        $this->importConfig($type, $name);
      }
    }

    // Update existing configuration.
    foreach ($data['update'] as $type => $items) {
      foreach ($items as $name) {
        try {
          $this->updateConfig($type, $name);
        } catch (FieldStorageDefinitionUpdateForbiddenException $e) {
          $filename = $this->getFullName($type, $name);
          throw new \Exception('Forbidden values in the configuration file: ' . $filename);
        }
      }
    }
  }

  /**
   * Revert a single configuration file.
   * This deals with dependencies.
   * @param type $filename
   *  The file name without the file extension.
   */
  public function updateConfigFile($filename) {
    list($type, $name) = $this->getSplitName($filename);

    $this->updateConfig($type, $name);
  }

  /**
   * Import a single configuration file.
   * This deals with dependencies.
   * @param type $filename
   *  The file name without the file extension.
   */
  public function importConfigFile($filename) {
    list($type, $name) = $this->getSplitName($filename);

    $this->importConfig($type, $name);
  }

  /**
   * Revert a new configuration by $type and $name.
   * @param type $type
   * @param type $name
   * @throws Exception
   */
  protected function updateConfig($type, $name) {

    // Recreate the filename
    $filename = $this->getFullName($type, $name);
    if (empty($filename)) {
      throw new \Exception('The config entity of type: ' . $type . ' does not exist');
    }

    // Check for dependencies.
    $this->importDependencies($filename);

    // Check if the configuration exists in code but not in the database.
    $config_not_in_db = $this->configFactory->getEditable($filename)->isNew();
    if ($config_not_in_db) {
      if (!$this->configReverter->import($type, $name)) {
        // At this point it means that the file does not exist in either
        // install or optional folders.
        throw new \Exception('Could not import the configuration file: ' . $filename);
      }
    }
    else {
      if (!$this->configReverter->revert($type, $name)) {
        throw new \Exception('Could not revert the configuration file: ' . $filename);
      }
    }
  }

  /**
   * Import a new configuration by $type and $name.
   * @param string $type
   * @param string $name
   * @throws Exception
   */
  protected function importConfig($type, $name) {

    // Recreate the filename
    $filename = $this->getFullName($type, $name);
    if (empty($filename)) {
      throw new \Exception('The config entity of type: ' . $type . ' does not exist');
    }

    // Check if the config is already in the system.
    if ($this->activeConfigStorage->read($filename)) {
      return;
    }

    // Check for dependencies.
    $this->importDependencies($filename);

    // Import the current file.
    if (!$this->configReverter->import($type, $name)) {
      // At this point it means that the file does not exist in either
      // install or optional folders.
      throw new \Exception('Could not find the configuration file: ' . $filename);
    }
  }

  /**
   * Get a formated list of configuration files from a module
   * that can be used by the configuration update module.
   *
   * @param string $module
   * @return array
   */
  protected function getModuleConfigs($module) {
    // Get all the config files for this module.
    $configs = $this->getModuleConfigFiles($module);

    $list = [
      'new' => [],
      'update' => [],
    ];
    // Arrange the entity configs in a [$type => $name] array
    // to be used with config update module
    foreach ($this->getConfigEntitesInfo() as $prefix => $entityName) {
      foreach ($configs as $id => $name) {
        if (strpos($name, $prefix) === 0) {
          // Check if it's a new or existing config.
          $state = $this->activeConfigStorage->read($name) ? 'update' : 'new';
          $list[$state][$entityName][] = strtr($name, [$prefix . '.' => '']);
          unset($configs[$id]);
        }
      }
    }

    // Add the simple config list
    foreach ($configs as $name) {
      $state = $this->activeConfigStorage->read($name) ? 'update' : 'new';
      $list[$state]['system.simple'][] = $name;
    }

    return $list;
  }

  /**
   * Returns a list of configurations files from a given module.
   * @param string $module
   * @return array
   */
  public function getModuleConfigFiles($module) {
    // Get the module path.
    $path = $this->moduleHandler->getModule($module)->getPath();

    // Get all the config files.
    $listing = new ExtensionDiscovery(\Drupal::root());
    return array_keys(array_filter(
      $this->extensionConfigStorage->getComponentNames($listing->scan('module')),
      function ($item) use ($path) {
        return strpos($item, $path) === 0;
      }
    ));
  }

  /**
   * Get the list of all configuration entities in the system.
   * @return array
   *  The configuration list indexed by the prefix.
   */
  protected function getConfigEntitesInfo() {
    // Create a list of config entity types.
    $list = [];
    foreach ($this->entityManager->getDefinitions() as $name => $definition) {
      if ($definition instanceof \Drupal\Core\Config\Entity\ConfigEntityType) {
        $list[$definition->getConfigPrefix()] = $name;
      }
    }

    return $list;
  }

  /**
   * Get the $type, $name pair for a configuration file.
   * that can be used by the configuration update module.
   *
   * @param string $filename
   *  The configuration file name (without the file extension)
   * @return array
   *  A list with $type and $name
   */
  protected function getSplitName(string $filename): array {

    // Arrange the entity config in a [$type => $name] array
    // to be used with config update module
    foreach ($this->getConfigEntitesInfo() as $prefix => $entity_name) {
      if (strpos($filename, $prefix) === 0) {
        return [$entity_name, strtr($filename, [$prefix . '.' => ''])];
      }
    }

    // If it's not an entity it means it's a simple config.
    return ['system.simple', $filename];
  }

  /**
   * Returns the full name of a configuration item.
   *
   * @param string $type
   *   The config type, to indicate $name is already prefixed.
   * @param string $name
   *   The config name, without prefix.
   *
   * @return string
   *   The config item's full name, or FALSE if there is an error.
   */
  protected function getFullName($type, $name) {
    if ($type == 'system.simple' || !$type) {
      return $name;
    }

    $definition = $this->entityManager->getDefinition($type);
    if ($definition) {
      return $definition->getConfigPrefix() . '.' . $name;
    }
    else {
      return FALSE;
    }
  }

  /**
   * Import the dependencies from a config file.
   *
   * @param string $filename
   *   The config file name without the file extension.
   */
  protected function importDependencies($filename) {
    // Check for dependencies.
    $value = $this->extensionConfigStorage->read($filename);
    // If we have dependencies, try to import those first.
    if (!empty($value['dependencies']['config'])) {
      foreach ($value['dependencies']['config'] as $dependency) {
        // Get the type => name pair.
        list($type, $name) = $this->getSplitName($dependency);
        // Import the dependency.
        $this->importConfig($type, $name);
      }
    }
  }
}
