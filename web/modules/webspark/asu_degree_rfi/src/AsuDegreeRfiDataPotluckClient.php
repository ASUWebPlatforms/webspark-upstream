<?php

namespace Drupal\asu_degree_rfi;

use Drupal\asu_data_potluck\PotluckClient;

/**
 * ASU Degree RFI module Data Potluck client.
 *
 * Interfaces with the ASU Data Potluck Client.
 */
class AsuDegreeRfiDataPotluckClient {

  /**
   * ASU Data Potluck Client.
   *
   * @var \Drupal\asu_data_potluck\PotluckClient
   */
  protected $potluckClient;

  /**
   * AsuDegreeRfiDataPotluckClient constructor.
   *
   * @param \Drupal\asu_data_potluck\PotluckClient $potluck_client
   *   The ASU Data Potluck Client.
   */
  public function __construct(PotluckClient $potluck_client) {
    $this->potluckClient = $potluck_client;
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
   * Data Potluck Academic Plan Codeset Docs
   *   https://asudev.jira.com/wiki/spaces/DPL/pages/2796192305/Academic+Plan+codeset
   *
   * Data Potluck API
   *   https://api.myasuplat-dpl.asu.edu/
   *
   * Notes from the DPL transition document
   *   https://docs.google.com/document/d/1mYxkthy1FreLszg1_gXotmtL6pcUX_rqz624EqtJKwI/edit
   *
   * Academic Plans (multiple)
   *   https://api.myasuplat-dpl.asu.edu/api/codeset/acad-plans
   *   https://api.myasuplat-dpl.asu.edu/api/codeset/acad-plans[?ownedByCollege={acadOrg}...][&ownedByDepartment={acadOrg}...][&acadPlanType={acadPlanTypeCode}...][&degreeType={UG|UGCM|GR|OTHR}...][&include=detail][&include=*][&include={fieldName}][&filter=activeInDegreeSearch]
   *
   * Academic Plan
   *   https://api.myasuplat-dpl.asu.edu/api/codeset/acad-plan
   *   https://api.myasuplat-dpl.asu.edu/api/codeset/acad-plan/{acadPlanCode}[?include=detail][&include=*][&include={fieldName}]
   *
   * @param array $params
   *   Array of params including method and fields.
   * @param string $codeSet
   *   Data Potluck codeset.
   *
   * @return array
   *   Response data.
   */
  public function degreeQuery(array $params, string $codeSet = NULL) {
    return $this->potluckClient->getData('codeset/' . $codeSet, [
      // Array of params including method and fields.
      'query' => $params,
    ]);
  }

  /**
   * Get a specific Degree's data by Degree code.
   *
   * @param string $code
   *   Degree code.
   *
   * @return array
   *   Response data.
   */
  public function degreeLookup(string $code) {
    return $this->potluckClient->getData('codeset/acad-plan/' . $code);
  }

  // Services reference:
  // Docs: https://api.myasuplat-dpl.asu.edu/
  // https://api.myasuplat-dpl.asu.edu/api/codeset/countries
  // https://api.myasuplat-dpl.asu.edu/api/codeset/country/US
  // https://api.myasuplat-dpl.asu.edu/api/codeset/country/CA
  // https://api.myasuplat-dpl.asu.edu/api/codeset/colleges

  /**
   * Get countries (options-ready).
   *
   * @return array
   *   Array of countries and codes for select options.
   */
  public function getCountries() {
    $country_data = [];
    // Do service call and build out the return data.
    $json_data = $this->potluckClient->getData('codeset/countries');
    foreach ($json_data as $row) {
      // For options...
      $country_data[$row["countryCodeTwoChar"]] = $row["description"];
    }
    return $country_data;
  }

  /**
   * Get US states/provinces (options-ready).
   *
   * @param array $countries
   *   Array of country codes.
   *
   * @return array
   *   Array of states/provinces and codes for select options.
   */
  public function getStatesProvinces(array $countries = ['US', 'CA']) {
    $state_province_output = [];
    foreach ($countries as $country) {
      $json_data = $this->potluckClient->getData('codeset/country/' . $country);
      foreach ($json_data['states'] as $row) {
        // Segment by country.
        $state_province_output[$country][$row["stateCode"]] = $row["description"];
      }
    }
    return $state_province_output;
  }

  /**
   * Get colleges (options-ready).
   *
   * @return array
   *   Array of colleges and codes for select options.
   */
  public function getColleges() {
    $college_output = [];
    $json_data = $this->potluckClient->getData('codeset/colleges');
    foreach ($json_data as $row) {
      $college_output[$row["acadOrgCode"]] = $row["description"] . " : " . $row['acadOrgCode'];
    }
    asort($college_output);
    return $college_output;
  }

  /**
   * Get campuses (options-ready).
   *
   * @return array
   *   Array of campuses and codes for select options.
   */
  public function getCampuses() {
    $campus_output = [];
    $json_data = $this->potluckClient->getData('codeset/campuses');
    foreach ($json_data as $row) {
      $campus_output[$row["campusCode"]] = $row["description"] . " : " . $row['campusCode'];
    }
    asort($campus_output);
    return $campus_output;
  }

  /**
   * Get Areas of Interest (options-ready).
   *
   * @param string $program
   *   Program code.
   *
   * @return array
   *   Areas of Interest.
   */
  public function getAreasOfInterest($program) {

    $aoi_options = [];

    $response = $this->degreeQuery(
      [
        'degreeType' => $program,
        'method' => 'findAllDegrees',
        'include' => 'planCategories',
      ],
      "acad-plans"
    );

    // Process and return as options-ready key-value array.
    foreach ($response as $row) {
      // Using value as key will do dedupe for us.
      if (!empty($row['planCategories'])) {
        foreach ($row['planCategories'] as $r) {
          $aoi_options[$r['categoryDescription']] = $r['categoryDescription'];
        }
      }
    }
    asort($aoi_options, SORT_STRING);
    return $aoi_options;
  }

  /**
   * Get Programs of Interest (options-ready).
   *
   * @param string $program
   *   Program code.
   *
   * @return array
   *   Programs of Interest.
   */
  public function getProgramsOfInterest($program) {

    $poi_options = [];

    $response = $this->degreeQuery(
      [
        'degreeType' => $program,
        'method' => 'findAllDegrees',
      ],
      "acad-plans"
    );

    // Process and return as options-ready key-value array.
    foreach ($response as $row) {
      $poi_options[$row['acadPlanCode']] = $row['acadPlanDescription'] . ' : ' . $row['acadPlanCode'];
    }
    asort($poi_options, SORT_STRING);
    return $poi_options;
  }

  /**
   * Get Departments (options-ready).
   *
   * @param string $program
   *   Program code.
   *
   * @return array
   *   Departments.
   */
  public function getDepartments($program) {

    $dept_options = [];

    $response = $this->degreeQuery(
      [
        'program' => $program,
        'method' => 'findAllDegrees',
        'fields' => 'DepartmentCode,DepartmentName',
      ],
      "acad-plans"
    );

    // Process and return as options-ready key-value array.
    foreach ($response as $row) {
      if (!empty($row['owners'])) {
        foreach ($row['owners'] as $r) {
          $dept_options[$r['departmentAcadOrg']] = $r['departmentDescription'] . ' : ' . $r['departmentAcadOrg'];
        }
      }
    }
    asort($dept_options, SORT_STRING);
    return $dept_options;
  }

  /**
   * Get degree by AcadPlan.
   *
   * @param string $acad_plan_code
   *   Academic Plan code.
   *
   * @return array|bool
   *   Response data or FALSE.
   */
  public function getDegreeByAcadPlan(string $acad_plan_code) {

    $response = $this->degreeLookup($acad_plan_code);

    return is_array($response) ? $response : FALSE;
  }

}
