<?php

namespace Drupal\asu_degree_rfi\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\node\Entity\Node;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Drupal\Core\Url;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\asu_degree_rfi\AsuDegreeRfiDegreeSearchClient;
use Drupal\asu_degree_rfi\AsuDegreeRfiInterface;
use Symfony\Component\HttpFoundation\Response;

/**
 * Controller for the RFI component proxy to the Submit Handler Lambda.
 */
class AsuDegreePagesCreation extends ControllerBase {
  /**
   * @var \Drupal\asu_degree_rfi\AsuDegreeRfiDegreeSearchClient
   */
  protected $degreeSearchClient;

  /**
   * {@inheritdoc}
   */
  public function __construct(AsuDegreeRfiDegreeSearchClient $degree_client) {
    $this->degreeSearchClient = $degree_client;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('asu_degree_rfi_degree_search_client')
    );
  }

  public function load() {
    $path = \Drupal::service('path.current')->getPath();
    $pattern_url = AsuDegreeRfiInterface::ASU_DEGREE_RFI_DETAIL_PATH_PATTERN;

    $node_storage = \Drupal::service('entity_type.manager')->getStorage('node');
    $split_path = explode('/', $path);

    if (preg_match($pattern_url, $path)) {
      // Check if the Degree listing page exists.
      if (!isset($split_path[6]) || $node_storage->loadByProperties(['nid' => $split_path[6], 'type' => 'degree_listing_page']) == NULL) {
        $message = $this->t('The Degree listing page with nid: @nid could not be found', ['@nid' => $split_path[6]]);
        \Drupal::logger('asu_degree_rfi')->warning($message);
        return ['#markup' => $message];
      }

      $node = Node::create(['type' => 'degree_detail_page']);
      $degree_query = $this->degreeSearchClient->getDegreeByAcadPlan($split_path[3]);
      $title = isset($degree_query[0]['Descr100']) ? $degree_query[0]['Descr100'] : $split_path[3];
      $node->set('title', $title);
      $node->set('field_degree_detail_acadplancode', $split_path[3]);
      $node->status = 1;
      $node->enforceIsNew();
      $node->set('path', $path);
      $node->save();
      $url = Url::fromRoute('entity.node.canonical', ['node' => $node->id()])->toString();
      $response = new RedirectResponse(URL::fromUserInput($url)->toString());
      $response->send();
    } else {
      return ['#markup' => $this->t('The requested page could not be found.')];
    }
  }
}
