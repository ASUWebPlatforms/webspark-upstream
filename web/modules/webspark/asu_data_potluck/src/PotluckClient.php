<?php declare(strict_types = 1);

namespace Drupal\asu_data_potluck;

use Drupal\Component\Serialization\Json;
use Drupal\Core\Config\ConfigFactory;
use Drupal\Core\Http\ClientFactory;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\Core\Messenger\MessengerInterface;
use GuzzleHttp\Exception\RequestException;
use \GuzzleHttp\Client;

/**
 * A service to get data from the Potluck API.
 */
class PotluckClient {

  /**
   * @var \Drupal\Core\Config\ConfigFactory
   */
  protected ConfigFactory $configFactory;

  /**
   * @var \GuzzleHttp\Client
   */
  protected Client $client;

  /**
   * @var \Drupal\Core\Logger\LoggerChannelFactoryInterface
   */
  protected LoggerChannelFactoryInterface $loggerFactory;

  /**
   * @var \Drupal\Core\Messenger\MessengerInterface
   */
  protected MessengerInterface $messenger;

  /**
   * Constructs the PotluckClient object.
   *
   * @param \Drupal\Core\Config\ConfigFactory $configFactory
   *   The config factory.
   * @param \Drupal\Core\Http\ClientFactory $httpClientFactory
   *   The http client factory.
   * @param \Drupal\Core\Logger\LoggerChannelFactoryInterface $loggerFactory
   *   The logger.
   * @param \Drupal\Core\Messenger\MessengerInterface $messenger
   *   The messenger.
   */
  public function __construct(ConfigFactory $configFactory,ClientFactory $httpClientFactory, LoggerChannelFactoryInterface $loggerFactory, MessengerInterface $messenger) {
    $this->configFactory = $configFactory;
    $this->client = $httpClientFactory->fromOptions([
      'base_uri' => $this->configFactory->getEditable('asu_data_potluck.settings')->get('asu_data_potluck.datasource_endpoint'),
    ]);
    $this->loggerFactory = $loggerFactory;
    $this->messenger = $messenger;
  }

  /**
   * A generic method to get data from the API.
   *
   * @param string $path
   *   The path to the data.
   * @param array $options
   *   An array of options to pass to the API.
   *
   * @throws \GuzzleHttp\Exception\GuzzleException
   */
  public function getData(string $path, array $options = []) {
    try {
      // Do service call and build out the return data.
      $response = $this->client->get($path, $options);
      return Json::decode($response->getBody());
    } catch (RequestException $exception) {
      $msg = t("Failed to retrieve field data: :code - :msg", [":code" => $exception->getCode(), ":msg" => $exception->getMessage()]);
      $this->loggerFactory->get('asu_data_potluck')->error($msg);
      $this->messenger->addError(t('Please try again in 5 minutes.') . ' ' . $msg);
    }
  }

}
