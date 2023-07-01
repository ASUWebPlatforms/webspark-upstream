<?php

namespace Drupal\asu_degree_rfi;

/**
 * Provides an interface for mymodule constants.
 */
interface AsuDegreeRfiInterface {
  /**
   * Caching duration for field data service calls.
   */
  const ASU_DEGREE_RFI_CACHE_LIFE = "+12 hours";

  /**
   * Path pattern used for Degree Detail pages.
   *
   * URL Pattern breakdown
   * [program type]/majorinfo/[plan code]/[program type]/[cert or minor boolean]/[degree listing nid for breadcrumbs]
   * More details captured on https://asudev.jira.com/browse/WS2-691
   * We depart some from the Degree Search URL pattern found at
   * https://docs.google.com/spreadsheets/d/1xHHT8v0EqBkKTasL0HM29lJdTbPcnCPso2AHkl_BPU4/edit#gid=0
   */
  const ASU_DEGREE_RFI_DETAIL_PATH_PATTERN = '/^\/(bachelors\-degrees|undergraduate\-certificates|graduate\-certificates|masters\-degrees-phds)\/majorinfo\/[A-Z0-9]+\/(undergrad|graduate)\/(true|false)\/[0-9]+$/';
}
