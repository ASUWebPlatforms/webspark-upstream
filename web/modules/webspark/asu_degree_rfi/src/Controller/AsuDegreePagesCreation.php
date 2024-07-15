<?php

namespace Drupal\asu_degree_rfi\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\node\Entity\Node;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Drupal\Core\Url;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\asu_degree_rfi\AsuDegreeRfiDataPotluckClient;
use Drupal\asu_degree_rfi\AsuDegreeRfiInterface;

/**
 * Controller for the RFI component proxy to the Submit Handler Lambda.
 */
class AsuDegreePagesCreation extends ControllerBase {
  /**
   * Data Potluck client.
   *
   * @var \Drupal\asu_degree_rfi\AsuDegreeRfiDataPotluckClient
   */
  protected $dataPotluckClient;

  /**
   * {@inheritdoc}
   */
  public function __construct(AsuDegreeRfiDataPotluckClient $data_potluck_client) {
    $this->dataPotluckClient = $data_potluck_client;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('asu_degree_rfi_data_potluck_client')
    );
  }

  /**
   * Load the RFI page.
   */
  public function load() {
    $path = \Drupal::service('path.current')->getPath();
    $pattern_url = AsuDegreeRfiInterface::ASU_DEGREE_RFI_DETAIL_PATH_PATTERN;

    $node_storage = \Drupal::service('entity_type.manager')->getStorage('node');
    $split_path = explode('/', $path);

    if (preg_match($pattern_url, $path)) {
      // Check if the Degree listing page exists.
      $degree_listing_page = $node_storage->loadByProperties([
        'nid' => $split_path[6],
        'type' => 'degree_listing_page',
      ]);
      if (!isset($split_path[6]) || $degree_listing_page == NULL) {
        $message = $this->t('The Degree listing page with nid: @nid could not be found', ['@nid' => $split_path[6]]);
        \Drupal::logger('asu_degree_rfi')->warning($message);
        return ['#markup' => $message];
      }

      $node = Node::create(['type' => 'degree_detail_page']);
      $degree_query = $this->dataPotluckClient->getDegreeByAcadPlan($split_path[3]);
      if ($degree_query) {
        $title = $degree_query['acadPlanDescription'] ?? $split_path[3];
        $node->set('title', $title);
        $node->set('field_degree_detail_acadplancode', $split_path[3]);
        $node->set('status', 1);
        $node->enforceIsNew();
        $node->set('path', $path);
        $node->save();

        // Needed for anonymous flow
        \Drupal::service('page_cache_kill_switch')->trigger();

        $url = Url::fromRoute('entity.node.canonical', ['node' => $node->id()])->toString();
        $response = new RedirectResponse($url);
        $response->send();

      }
      return ['#markup' => $this->t('The requested page could not be found.')];
    }

    return ['#markup' => $this->t('The requested page could not be found.')];
  }

}
