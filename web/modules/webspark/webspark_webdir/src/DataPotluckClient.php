<?php

namespace Drupal\webspark_webdir;

use Drupal\Component\Serialization\Json;
use Drupal\Core\Http\ClientFactory;
use Psr\Log\LoggerInterface;
use Drupal\Core\Messenger\MessengerInterface;

class DataPotluckClient {

  /**
   * Http Client service.
   *
   * @var \GuzzleHttp\Client
   */
  protected $client;

  /**
   * Logger service.
   *
   * @var Psr\Log\LoggerInterface;
   */
  protected $logger;

  /**
   * Messenger service.
   *
   * @var \Drupal\Core\Messenger\MessengerInterface
   */
  protected $messenger;

  /**
   * DataPotluckClient constructor.
   *
   * @param \Drupal\Core\Http\ClientFactory $http_client_factory
   *  The Http Client service.
   * @param \Psr\Log\LoggerInterface $logger
   *  The logger service.
   * @param \Drupal\Core\Messenger\MessengerInterface $messenger
   *  The messenger service.
   */
  public function __construct(
    ClientFactory $http_client_factory,
    LoggerInterface $logger,
    MessengerInterface $messenger) {
      $this->client = $http_client_factory->fromOptions([
        'base_uri' => 'https://api.myasuplat-dpl.asu.edu/',
      ]);

      $this->logger = $logger;
      $this->messenger = $messenger;
  }

  /**
   * Get campuses (options-ready).
   *
   * @return array
   */
  public function campuses(): array {
    $campus_output = [];

    try {
      $response = $this->client->get('api/codeset/campuses');

      $json_data = Json::decode($response->getBody());
    } catch (\Throwable $exception) {
      $msg = t(
        'Failed to retrieve campus field data: :code - :msg',
        [
          ':code' => $exception->getCode(),
          ':msg' => $exception->getMessage()
        ]
      );

      $this->logger->error($msg);

      $this->messenger->addError(t('Please try again in 5 minutes.') . ' ' . $msg);

      return [];
    }

    foreach ($json_data as $row) {
      $campus_output[$row['campusCode']] = $row['description'] . ' : ' . $row['campusCode'];
    }

    asort($campus_output);

    return $campus_output;
  }
}
