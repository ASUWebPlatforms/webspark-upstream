<?php

namespace Drupal\asu_degree_rfi;

use Drupal\Component\Serialization\Json;
use \GuzzleHttp\Exception\RequestException;

class AsuDegreeRfiDegreeSearchClient {

  /**
   * @var \GuzzleHttp\Client
   */
  protected $client;

  /**
   * AsuDegreeRfiDegreeSearchClient constructor.
   *
   * @param \Drupal\Core\Http\ClientFactory $http_client_factory
   */
  public function __construct($http_client_factory) {
    $this->client = $http_client_factory->fromOptions([
      'base_uri' => 'https://degreesearch-proxy.apps.asu.edu/',
    ]);
  }

  /**
   * Get Degree Search response data for user supplied fields.
   *
   * Fields reference:
   *   https://docs.google.com/spreadsheets/d/18_0EuMOTdrJHhIFgVsl9o8QSpuCPjIF823D1B91MzgU/edit#gid=0
   *
   * Methods: findAllDegrees, findDegreeByAcadPlan, findDegreeByCollege
   *   Note: not all methods have been tested. degreeQuery() may require work.
   *
   * @param array $params
   *
   * @return array
   */
  public function degreeQuery(array $params) {

    $output = null;
    try {
      $response = $this->client->get('degreesearch/', [
        'query' => $params // array of params including method and fields
      ]);
      $output = Json::decode($response->getBody());
    } catch (RequestException $exception) {
      // Note: Failures for this service don't always throw exceptions.
      $msg = t("Failed to retrieve degree field data: :code - :msg", [":code" => $exception->getCode(), ":msg" => $exception->getMessage()]);
      \Drupal::logger('asu_degree_rfi')->error($msg);
      \Drupal::messenger()->addError(t('Please try again in 5 minutes.') . ' ' . $msg);
      return $output = false;
    }

    return $output;
  }

  /**
   * Get Areas of of Interest (options-ready).
   *
   * @param string $program
   * @param string $cert
   *
   * @return array
   */
  public function areasOfInterest($program, $cert) {

    $aoi_options = [];

    $response = $this->degreeQuery(
      [
        'program' => $program,
        'cert' => $cert,
        'method' => 'findAllDegrees',
        'fields' => 'planCatDescr',
        'init' => 'false'
      ]
    );

    // Process and return as options-ready key-value array.
    foreach ($response['programs'] as $row) {
      // Using value as key will do dedupe for us.
      foreach ($row['planCatDescr'] as $r) {
        $aoi_options[$r] = $r;
      }
    }
    asort($aoi_options, SORT_STRING);
    return $aoi_options;
  }

  /**
   * Get Programs of Interest (options-ready).
   *
   * @param string $program
   * @param string $cert
   *
   * @return array
   */
  public function programsOfInterest($program, $cert) {

    $poi_options = [];

    $response = $this->degreeQuery(
      [
        'program' => $program,
        'cert' => $cert,
        'method' => 'findAllDegrees',
        'fields' => 'Descr100,AcadPlan',
        'init' => 'false'
      ]
    );

    // Process and return as options-ready key-value array.
    foreach ($response['programs'] as $row) {
      $poi_options[$row['AcadPlan']] = $row['Descr100'] . ' : ' . $row['AcadPlan'];
    }
    asort($poi_options, SORT_STRING);
    return $poi_options;
  }

  /**
   * Get Departments (options-ready).
   *
   * @param string $program
   * @param string $cert
   *
   * @return array
   */
  public function departments($program, $cert) {

    $dept_options = [];

    $response = $this->degreeQuery(
      [
        'program' => $program,
        'cert' => $cert,
        'method' => 'findAllDegrees',
        'fields' => 'DepartmentCode,DepartmentName',
        'init' => 'false'
      ]
    );

    // Process and return as options-ready key-value array.
    foreach ($response['programs'] as $row) {
      $dept_options[$row['DepartmentCode']] = $row['DepartmentName'] . ' : ' . $row['DepartmentCode'];
    }
    asort($dept_options, SORT_STRING);
    return $dept_options;
  }

  /**
   * Get degree by AcadPlan.
   *
   * @param string $acad_plan_code
   *
   * @return boolean
   */
  public function getDegreeByAcadPlan(string $acad_plan_code) {

    $response = $this->degreeQuery(
      [
        'method' => 'findDegreeByAcadPlan',
        'acadPlan' => $acad_plan_code,
        'fields' => 'AcadPlan,Descr100,AcadProg,AcadPlanType',
        'init' => 'false'
      ]
    );

    // Only the one... or none.
    return is_array($response) ? $response['programs'] : false;
  }
}
