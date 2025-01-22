<?php

namespace Drupal\asu_degree_rfi\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use GuzzleHttp\Exception\RequestException;

/**
 * Controller for the RFI component proxy to the Submit Handler Lambda.
 */
class AsuDegreeRfiSubmitProxy extends ControllerBase {
  /**
   * RFI Submit Proxy.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   The current request
   *
   * @return array
   *   Response.
   */
  public function asuRfiSubmit(Request $request) {

    // Get POST payload submitted to this controller.
    $payload = array();
    $content = $request->getContent();
    if (!empty($content)) {
      // Get payload as an assoc array.
      $payload = json_decode($content, TRUE);

      // Replace source
      // Pull in global configs for module.
      $global_config = \Drupal::config('asu_degree_rfi.settings');
      $source_id = $global_config->get('asu_degree_rfi.rfi_source_id');
      $submit_handler_url = $global_config->get('asu_degree_rfi.rfi_submission_handler_url');

      // Patch in our Source ID from module's global configs.
      $payload['Source'] = $source_id;

      // POST to RFI Submission Handler Lambda using Guzzle httpClient.
      $client = \Drupal::httpClient();
      try {
        $request = $client->post($submit_handler_url, [
          'json' => $payload
        ]);
        $response = json_decode($request->getBody());
      } catch (RequestException $e) {
        // Log the exception/fail with copy of payload.
        $fail_msg = "Failed RFI submission: <pre>"
          . "\nPAYLOAD " . var_export($payload, 1)
          . "\nEXCEPTION $e "
          . "</pre>";
        \Drupal::logger('RFI failure')->debug($fail_msg);
        // Mail the site owner with the failure.
        asu_degree_rfi_send_rfi_fail_email($fail_msg, $payload);
        return new JsonResponse('Failed');
      }
      // A note on logging of payloads: Logging goes to dblog and will be
      // subject to the eventual purge inherent to that log, so no long term
      // storage of personal data is enabled by this logging.

      // Log success with payload
      \Drupal::logger('RFI success')->debug("Successful RFI submission: <pre>"
        . "\nSTATUS " . var_export($request->getStatusCode(), 1)
        . "\nRESPONSE " . var_export($response, 1)
        . "\nPAYLOAD " . var_export($payload, 1)
        . "</pre>");
      return new JsonResponse('Success', $request->getStatusCode());
    }

    return new JsonResponse('Nothing to submit', 200);
  }
}
