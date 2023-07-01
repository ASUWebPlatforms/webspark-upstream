<?php

namespace Drupal\webspark_webdir\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\webspark_webdir\WebdirApiUrl;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * An example controller.
 */
class WebdirController extends ControllerBase {

  protected $settings;
  protected $client;
  
  
  public function __construct() {
    $this->settings = \Drupal::config('webspark_webdir.settings');
    $this->client = \Drupal::httpClient();
    $this->api_url = new WebdirApiUrl;
  }
  
  /**
   * Returns the departments json.
   */
  public function departments() {
    // Build the departments URL.
    $url = $this->api_url->getUrlBase() . $this->settings->get('departments');
    
    return $this->retriveJsonFromService($url);
  }
  
  /**
   * Returns the people in department json.
   */
  public function peopleInDepartment() {
    // Build the departments URL.
    $url = $this->api_url->getUrlBase() . $this->settings->get('people_department');
    $query = \Drupal::request()->getQueryString();
    
    return $this->retriveJsonFromService($url, $query);
  }
  
  /**
   * Returns the profiles by department json.
   */
  public function profilesByDepartment() {
    // Build the departments URL.
    $data = \Drupal::request()->getContent();
    
    $url = $this->api_url->getUrlBase() . $this->settings->get('people_data');
    
    return $this->retriveJsonFromServicePost($url, $data);
  }
  
  /**
   * Returns the search staff json.
   */
  public function searchStaff() {
    
    $url = $this->api_url->getUrlBase() . $this->settings->get('people_search');
    $query = \Drupal::request()->getQueryString();
    
    return $this->retriveJsonFromService($url, $query);
  }

  /**
   * Get a list of profile affiliations from the API
   * @return string
   */
  public function profileAffiliations() {
    $url = $this->api_url->getUrlBase() . $this->settings->get('profile_affiliations');
    $query = \Drupal::request()->getQueryString();
    
    return $this->retriveJsonFromService($url, $query);
  }
  
  /**
   * Get a list of employee types from the API
   * @return string
   */
  public function employeeTypes() {
    $url = $this->api_url->getUrlBase() . $this->settings->get('employee_types');
    
    return $this->retriveJsonFromService($url);
  }
  
  /**
   * Get a list of expertise areas from the API
   * @return string
   */
  public function expertiseAreas() {
    $url = $this->api_url->getUrlBase() . $this->settings->get('expertise_areas');
    
    return $this->retriveJsonFromService($url);
  }
  
  /**
   * Get a list of expertise areas from the API
   * @return string
   */
  public function campuses() {
    $service = \Drupal::service('webspark_webdir.data_potluck_client');

    return new JsonResponse($service->campuses());
  }
  
  /**
   * Returns the people in department json.
   */
  public function filteredPeopleInDepartment() {
    // Build the departments URL.
    $url = $this->api_url->getUrlBase() . $this->settings->get('filtered_people_department');
    $query = \Drupal::request()->getQueryString();
    
    return $this->retriveJsonFromService($url, $query);
  }
  
  
  /**
   * Return the json from a webservice.
   */
  public function retriveJsonFromService($url, $query = NULL) {
    
    // Add the query if not NULL.
    if ($query) {
      $url = $url . '?' . $query;
    }

    $request = $this->client->get($url);
    $status = $request->getStatusCode();
    $content = $request->getBody()->getContents();
    $file_contents = json_decode($content);
    
    return new JsonResponse($file_contents);
  }
  /**
   * Return the json from a webservice.
   */
  public function retriveJsonFromServicePost($url, $data) {
    // Buid the options.
    $options = [
      'headers' => [
        'Content-Type' => 'application/json',
      ],
      'body' => $data
    ];
    // Send the request.
    $request = $this->client->post($url, $options);
    $content = $request->getBody()->getContents();
    $file_contents = json_decode($content);
    return new JsonResponse($file_contents);
  }

}
