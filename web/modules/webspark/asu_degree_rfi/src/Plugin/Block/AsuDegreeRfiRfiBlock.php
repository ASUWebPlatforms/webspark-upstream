<?php

namespace Drupal\asu_degree_rfi\Plugin\Block;

use Drupal\asu_degree_rfi\AsuDegreeRfiDataPotluckClient;
use Drupal\node\Entity\Node;
use Drupal\node\NodeInterface;
use Drupal\Core\Block\BlockBase;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Form\FormStateInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Link;
use Drupal\Core\Cache\Cache;
use Drupal\asu_degree_rfi\AsuDegreeRfiInterface;

/**
 * ASU Degree RFI module RFI component block.
 *
 * @Block(
 *   id = "asu_degree_rfi_rfi_block",
 *   admin_label = @Translation("RFI form component"),
 * )
 */
class AsuDegreeRfiRfiBlock extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * {@inheritdoc}
   */
  public function getCacheTags() {
    // Define cache tag.
    // With this when your node change your block will rebuild.
    if ($node = \Drupal::routeMatch()->getParameter('node')) {
      // If there is node add its cachetag.
      return Cache::mergeTags(parent::getCacheTags(), ['node:' . $node->id()]);
    }
    else {
      // Return default tags instead.
      // Gets invalidated when module and block settings are updated.
      return Cache::mergeTags(parent::getCacheTags(), ['rfi_block_cache']);
      // Return parent::getCacheTags();
    }
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheContexts() {
    // If you depends on \Drupal::routeMatch()
    // you must set context of this block with 'route' context tag.
    // Every new route this block will rebuild.
    return Cache::mergeContexts(parent::getCacheContexts(), ['route']);
  }

  /**
   * Note about Data Potluck REST API.
   *
   * We implement the Data Potluck service as a Drupal service.
   * See asu_degree_rfi.services.yml for entry points to
   * implementation + __construct() and create() below for how we consume it.
   * Based on https://www.hook42.com/blog/consuming-json-apis-drupal-8.
   */

  /**
   * The Data Potluck Client.
   *
   * @var \Drupal\asu_degree_rfi\AsuDegreeRfiDataPotluckClient
   */
  protected $dataPotluckClient;

  /**
   * AsuDegreeRfiRfiBlock constructor.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\asu_degree_rfi\AsuDegreeRfiDataPotluckClient $asu_degree_rfi_data_potluck_client
   *   The ASU Degree RFI Data Potluck Client.
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition, AsuDegreeRfiDataPotluckClient $asu_degree_rfi_data_potluck_client = NULL) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->dataPotluckClient = $asu_degree_rfi_data_potluck_client;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('asu_degree_rfi_data_potluck_client')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function build() {

    // If a degree detail page, gets the Program of Interest to be a default
    // fallback value for the PoI in the props.
    $route_pgm_of_interest = \Drupal::service('asu_degree_rfi.helper_functions')->getRouteProgramOfInterest();

    // Get path alias so we can look up if this is a certificate.
    $path = \Drupal::service('path.current')->getPath();
    $path_alias = \Drupal::service('path_alias.manager')->getAliasByPath($path);
    $pattern_url = AsuDegreeRfiInterface::ASU_DEGREE_RFI_DETAIL_PATH_PATTERN;
    // If path segment 5 is TRUE, it's a certificate. Set the default prop
    // value to for that.
    $isCertMinorDefault = NULL;
    if (preg_match($pattern_url, $path_alias)) {
      $split_path = explode('/', $path_alias);
      if ($split_path[5] == "true") {
        $isCertMinorDefault = TRUE;
      }
    }

    // RFI component blocks are deployed in 1 of 2 ways:
    // 1. RFI form component blocks are automatically created and configured
    //    with on-demand Degree detail page creation, with program of interest
    //    automatically set. 1:1 block relationship with Degree detail pages.
    // 2. RFI form component blocks can be deployed as regular blocks via
    //    layout builder.
    // Pass data from php:
    // https://codimth.com/blog/web/drupal/passing-data-php-javascript-drupal-8
    // Pull in global configs for module.
    $global_config = \Drupal::config('asu_degree_rfi.settings');

    // Pull in block-level configs (see blockForm()). Drupal manages deltas.
    $config = $this->getConfiguration();

    // Gather props to pass to JS as drupalSettings.
    $props = [];
    // From block instance config.
    // This first one falls back to a global config, and thus does not have a
    // default in core.entity_view_display.node.degree_detail_page.default.yml.
    $props['variant'] = isset($config['asu_degree_rfi_variant']) ? $config['asu_degree_rfi_variant'] : $global_config->get('asu_degree_rfi.rfi_variant_default');
    $props['campus'] = $config['asu_degree_rfi_campus'] ? $config['asu_degree_rfi_campus'] : NULL;
    if (isset($config['asu_degree_rfi_actual_campus'])) {
      $props['actualCampus'] = $config['asu_degree_rfi_actual_campus'] ? $config['asu_degree_rfi_actual_campus'] : NULL;
    }
    $props['college'] = $config['asu_degree_rfi_college'] ? $config['asu_degree_rfi_college'] : NULL;
    $props['department'] = $config['asu_degree_rfi_department'] ? $config['asu_degree_rfi_department'] : NULL;
    $props['studentType'] = $config['asu_degree_rfi_student_type'] ? $config['asu_degree_rfi_student_type'] : NULL;
    $props['areaOfInterest'] = $config['asu_degree_rfi_area_of_interest'] ? $config['asu_degree_rfi_area_of_interest'] : NULL;
    $props['areaOfInterestOptional'] = $config['asu_degree_rfi_a_of_i_optional'] ? $config['asu_degree_rfi_a_of_i_optional'] : NULL;
    $props['programOfInterest'] = $config['asu_degree_rfi_program_of_interest'] ? $config['asu_degree_rfi_program_of_interest'] : $route_pgm_of_interest;
    $props['programOfInterestOptional'] = $config['asu_degree_rfi_p_of_i_optional'] ? $config['asu_degree_rfi_p_of_i_optional'] : NULL;
    $props['isCertMinor'] = $config['asu_degree_rfi_is_cert_minor'] ? $config['asu_degree_rfi_is_cert_minor'] : $isCertMinorDefault;
    $props['country'] = $config['asu_degree_rfi_country'] ? $config['asu_degree_rfi_country'] : NULL;
    $props['stateProvince'] = $config['asu_degree_rfi_state_province'] ? $config['asu_degree_rfi_state_province'] : NULL;
    $props['successMsg'] = $config['asu_degree_rfi_success_msg']['value'] ? $config['asu_degree_rfi_success_msg']['value'] : NULL;
    $props['test'] = $config['asu_degree_rfi_test'] ? $config['asu_degree_rfi_test'] : NULL;
    // From global module config.
    $props['dataSourceDegreeSearch'] = $global_config->get('asu_degree_rfi.rfi_degree_search_datasource_endpoint') ? $global_config->get('asu_degree_rfi.rfi_degree_search_datasource_endpoint') : NULL;
    $props['dataSourceAsuOnline'] = $global_config->get('asu_degree_rfi.rfi_asuonline_datasource_endpoint') ? $global_config->get('asu_degree_rfi.rfi_asuonline_datasource_endpoint') : NULL;
    $props['dataSourceCountriesStates'] = $global_config->get('asu_degree_rfi.rfi_country_province_datasource_endpoint') ? $global_config->get('asu_degree_rfi.rfi_country_province_datasource_endpoint') : NULL;
    // Submit to the local proxy route that this module provides.
    // @todo .
    $props['submissionUrl'] = "/endpoint/asu-rfi-submit-proxy";
    // DEBUG $props['submissionUrl'] = "https://httpbin.org/post"; // TODO
    // Set default images path.
    $props['appPathFolder'] = \Drupal::service('asu_degree_rfi.helper_functions')->getappPathFolder('app-rfi');

    // Remove empties as they don't transfer well to JSON.
    $props = array_filter($props);

    $block_output = [];

    // If Source ID is not configured, display a message to that effect
    // for admin users and do not launch the RFI form.
    // If not set, and user has administer site content perm...
    if (!$global_config->get('asu_degree_rfi.rfi_source_id')) {
      $link = Link::createFromRoute('You must configure an RFI Source ID to enable the RFI form.', 'asu_degree_rfi.asu_degree_rfi_settings')
        ->toString();
      $warn_message = [
        '#theme' => 'status_messages',
        '#message_list' => ['warning' => [$this->t("@link", ['@link' => $link])]],
        '#status_headings' => [
          'status' => t('Status message'),
          'error' => t('Error message'),
          'warning' => t('Warning message'),
        ],
      ];
      $block_output = $warn_message;
      // Add the add the RFI component container.
    }
    else {

      // Markup containers where components will initialize.
      $block_output['#markup'] =
        $this->t('
        <!-- AsuRfi component will be initialized in this container. -->
        <div id="rfi-container"></div>
        ');
      // Attach components and helper js from asu_degree_rfi.libraries.yml.
      $block_output['#attached']['library'][] = 'asu_degree_rfi/app-rfi';
      // Pass block configs to javascript; taken up in js/asu_degree_rfi.rfi.js.
      $block_output['#attached']['drupalSettings']['asu_degree_rfi']['props'] = $props;
    }

    return $block_output;
  }

  /**
   * {@inheritdoc}
   */
  public function blockForm($form, FormStateInterface $form_state) {
    $form = parent::blockForm($form, $form_state);
    // Note: more configs required for component props (dataSource* fields) are
    // sourced from module admin settings.
    // Check if the form is loading in layout builder. If yes, and is a
    // degree_detail_page, get the Program of Interest to us as default value.
    // Note: the block output defaults to the node's PoI value in build if the
    // block's PoI field is empty and it's displaying on a degree_detail_page.
    // We do this to ensure proper contextuality and because by default the
    // value is empty on the blocks.
    $current_path = substr(\Drupal::service('path.current')->getPath(), 1);
    // @todo Turns out it's difficult to get the node ID or uuid for the node
    // in this context, so we turn to the path. Maybe there's a better way?
    $path_args = explode('/', $current_path);
    $route_pgm_of_interest = '';
    if ($path_args[0] === 'layout_builder') {
      $nid_part = explode('.', $path_args[4])[1];
      $lb_node = Node::load($nid_part);
      if ($lb_node instanceof NodeInterface && $lb_node->bundle() === 'degree_detail_page') {
        $route_pgm_of_interest = $lb_node->get('field_degree_detail_acadplancode')->getvalue()[0]['value'];
      }
    }

    $cache_time_to_live = AsuDegreeRfiInterface::ASU_DEGREE_RFI_CACHE_LIFE;

    // Get AoI options. Get from, or set cache.
    $cid = 'asu_degree_rfi:aoi_options';
    $aoi_options = [];
    if ($cache = \Drupal::cache()->get($cid)) {
      // Use the cached data.
      $aoi_options = $cache->data;
    }
    else {
      // Call DS REST service to get all the Area of Interest permutations.
      $aoi_ugrad = $this->dataPotluckClient->getAreasOfInterest('UG');
      $aoi_grad = $this->dataPotluckClient->getAreasOfInterest('GR');
      $aoi_ucert = $this->dataPotluckClient->getAreasOfInterest('UGCM');
      $aoi_other = $this->dataPotluckClient->getAreasOfInterest('OTHR');
      // Array merge will avoid creating dupes.
      $aoi_options = array_merge($aoi_ugrad, $aoi_grad, $aoi_ucert, $aoi_other);
      // Set the cache.
      \Drupal::cache()
        ->set($cid, $aoi_options, strtotime($cache_time_to_live));
    }

    // Get PoI options. Get from, or set cache.
    $cid = 'asu_degree_rfi:poi_options';
    $poi_options = [];
    if ($cache = \Drupal::cache()->get($cid)) {
      // Use the cached data.
      $poi_options = $cache->data;
    }
    else {
      // Call Data Potluck to get all the Program of Interest permutations.
      $poi_ugrad = $this->dataPotluckClient->getProgramsOfInterest('UG');
      $poi_grad = $this->dataPotluckClient->getProgramsOfInterest('GR');
      $poi_ucert = $this->dataPotluckClient->getProgramsOfInterest('UGCM');
      $poi_other = $this->dataPotluckClient->getProgramsOfInterest('OTHR');
      // Merge with headings to break up a looong select list.
      $poi_options = array_merge(
        ["Undergrad" => $poi_ugrad],
        ["Gradudate" => $poi_grad],
        ["Undergrad certificates and minors" => $poi_ucert],
        ["Other" => $poi_other]
          );
      // Set the cache.
      \Drupal::cache()
        ->set($cid, $poi_options, strtotime($cache_time_to_live));
    }

    // Get Department options. Get from, or set cache.
    $cid = 'asu_degree_rfi:dept_options';
    $dept_options = [];
    if ($cache = \Drupal::cache()->get($cid)) {
      // Use the cached data.
      $dept_options = $cache->data;
    }
    else {
      // Call DS REST service to get all the Program of Interest permutations.
      $dept_ugrad = $this->dataPotluckClient->getDepartments('UG');
      $dept_grad = $this->dataPotluckClient->getDepartments('GR');
      $dept_ucert = $this->dataPotluckClient->getDepartments('UGCM');
      $dept_gcert = $this->dataPotluckClient->getDepartments('OTHR');
      // Merge with headings to break up a looong select list.
      $dept_options = array_merge($dept_ugrad, $dept_grad, $dept_ucert, $dept_gcert);
      asort($dept_options);
      // Set the cache.
      \Drupal::cache()
        ->set($cid, $dept_options, strtotime($cache_time_to_live));
    }

    // Get college, campus, country and state options from Data Potluck
    // services. Only US and CA states/provinces. These are lightweight, so we
    // don't bother caching.
    $college_options = $this->dataPotluckClient->getColleges();
    $actual_campus_options = $this->dataPotluckClient->getCampuses();
    $country_options = $this->dataPotluckClient->getCountries();
    $state_province_options = $this->dataPotluckClient->getStatesProvinces(
      ['US', 'CA']
    );

    // Get the global config.
    $global_config = \Drupal::config('asu_degree_rfi.settings');

    // Config for this instance.
    $config = $this->getConfiguration();

    $form['asu_degree_rfi_variant'] = [
      '#type' => 'select',
      '#title' => $this->t('RFI form type variation'),
      '#description' => $this->t('Select whether the form should display as a one or two page form.'),
      '#options' => \Drupal::service('asu_degree_rfi.helper_functions')->getRfiVariantOptions(),
      '#default_value' => $config['asu_degree_rfi_variant'] ?? $global_config->get('asu_degree_rfi.rfi_variant_default')
    ];
    $form['asu_degree_rfi_college'] = [
      '#type' => 'select',
      '#title' => $this->t('College'),
      '#description' => $this->t('By selecting a College, degrees listed on the RFI form will be limited to those offered at that college. Colleges may contain multiple Departments.'),
      '#options' => array_merge(['' => $this->t('None')], $college_options),
      '#default_value' => $config['asu_degree_rfi_college'] ?? NULL,
    ];
    $form['asu_degree_rfi_department'] = [
      '#type' => 'select',
      '#title' => $this->t('Department code'),
      '#description' => $this->t('By selecting a Department code, degrees listed on the RFI form will be limited to those offered at that department. When configuring a Department code it is not necessary to configure a College.'),
      '#options' => array_merge(['' => $this->t('None')], $dept_options),
      '#default_value' => $config['asu_degree_rfi_department'] ?? NULL,
    ];
    $form['asu_degree_rfi_campus'] = [
      '#type' => 'select',
      '#title' => $this->t('Campus type'),
      '#description' => $this->t('Preconfigure the RFI form for a campus type.'),
      '#options' => [
        '' => $this->t('None'),
        'GROUND' => $this->t('On campus'),
        'ONLNE' => $this->t('Online'),
        'NOPREF' => $this->t('Not sure'),
      ],
      '#default_value' => $config['asu_degree_rfi_campus'] ?? '',
    ];
    $form['asu_degree_rfi_actual_campus'] = [
      '#type' => 'select',
      '#title' => $this->t('Campus'),
      '#description' => $this->t('By selecting a campus, degrees listed on the RFI form will be limited to those offered at that campus.'),
      '#options' => array_merge(['' => $this->t('None')], $actual_campus_options),
      '#default_value' => $config['asu_degree_rfi_actual_campus'] ?? NULL,
    ];
    $form['asu_degree_rfi_student_type'] = [
      '#type' => 'select',
      '#title' => $this->t('Student type'),
      '#description' => $this->t('Preconfigure RFI with a student type.'),
      '#options' => [
        '' => $this->t('None'),
        'undergrad' => $this->t('Undergraduate'),
        'graduate' => $this->t('Graduate'),
      ],
      '#default_value' => $config['asu_degree_rfi_student_type'] ?? '',
    ];
    $form['asu_degree_rfi_area_of_interest'] = [
      '#type' => 'select',
      '#title' => $this->t('Area of interest'),
      '#description' => $this->t('Preconfigure RFI with an area of interest.'),
      '#options' => array_merge(['' => $this->t('None')], $aoi_options),
      '#default_value' => $config['asu_degree_rfi_area_of_interest'] ?? '',
    ];
    $form['asu_degree_rfi_a_of_i_optional'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Area of interest is optional'),
      '#description' => $this->t('Set area of interest as optional. Not
        usually recommended.'),
      '#default_value' => isset($config['asu_degree_rfi_a_of_i_optional']) ?
      $config['asu_degree_rfi_a_of_i_optional'] : 0,
    ];
    // AKA plan code or academic plan code.
    $form['asu_degree_rfi_program_of_interest'] = [
      '#type' => 'select',
      '#title' => $this->t('Program of interest'),
      '#description' => $this->t('Preconfigure RFI with a program of interest.'),
      '#options' => array_merge(['' => $this->t('None')], $poi_options),
      '#default_value' => !empty($config['asu_degree_rfi_program_of_interest']) ?
      $config['asu_degree_rfi_program_of_interest'] : $route_pgm_of_interest,
    ];
    $form['asu_degree_rfi_p_of_i_optional'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Program of interest is optional'),
      '#description' => $this->t('Set program of interest as optional. Not
        usually recommended, but can be useful for non-academic units.'),
      '#default_value' => isset($config['asu_degree_rfi_p_of_i_optional']) ?
      $config['asu_degree_rfi_p_of_i_optional'] : 0,
    ];
    $form['asu_degree_rfi_is_cert_minor'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Is a certificate or minor'),
      '#description' => $this->t('Currently, certificates and minors are not
        rendered with a form and instead display the Success page message along
        with the email for the program.'),
      '#default_value' => $config['asu_degree_rfi_is_cert_minor'] ?? 0,
    ];
    // Options obtained via service call.
    $form['asu_degree_rfi_country'] = [
      '#type' => 'select',
      '#title' => $this->t('Country'),
      '#description' => $this->t('Preconfigure RFI for submissions from a specific country.'),
      '#options' => array_merge(['' => $this->t('None')], $country_options),
      '#default_value' => $config['asu_degree_rfi_country'] ?? '',
    ];
    // Options obtained via service call.
    $form['asu_degree_rfi_state_province'] = [
      '#type' => 'select',
      '#title' => $this->t('State or province'),
      '#description' => $this->t('Preconfigure RFI for submissions from a specific US state or Canadian province.'),
      '#options' => array_merge(['' => $this->t('None')], $state_province_options),
      '#default_value' => $config['asu_degree_rfi_state_province'] ?? '',
      '#states' => [
        'enabled' => [
          [
            ':input[name="settings[asu_degree_rfi_country]"]' => ['value' => 'US'],
          ],
          [
            ':input[name="settings[asu_degree_rfi_country]"]' => ['value' => 'CA'],
          ],
        ],
      ],
    ];
    $form['asu_brand_header_success_msg'] = [
      '#type' => 'text_format',
      '#title' => $this->t('Success page message'),
      '#description' => $this->t('Optional. Provide a custom success message to display after submit. Also used to customize the certificate and minor display.'),
      '#default_value' => $config['asu_degree_rfi_success_msg']['value'] ?? '',
      '#format' => 'basic_html',
      '#allowed_formats' => ['basic_html'],
    ];
    $form['asu_degree_rfi_test'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Run in test mode'),
      '#description' => $this->t('Check to launch the form in test mode. Submissions will have a test flag set.'),
      '#default_value' => $config['asu_degree_rfi_test'] ?? 0,
    ];

    // Note additional prop values for component launch will be sourced from
    // global admin settings.
    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function blockSubmit($form, FormStateInterface $form_state) {
    parent::blockSubmit($form, $form_state);

    // Break block cache when we save.
    Cache::invalidateTags(['rfi_block_cache']);

    $values = $form_state->getValues();

    $this->configuration['asu_degree_rfi_variant'] =
      $values['asu_degree_rfi_variant'];
    $this->configuration['asu_degree_rfi_college'] =
      $values['asu_degree_rfi_college'];
    $this->configuration['asu_degree_rfi_department'] =
      $values['asu_degree_rfi_department'];
    $this->configuration['asu_degree_rfi_campus'] =
      $values['asu_degree_rfi_campus'];
    $this->configuration['asu_degree_rfi_actual_campus'] =
      $values['asu_degree_rfi_actual_campus'];
    $this->configuration['asu_degree_rfi_student_type'] =
      $values['asu_degree_rfi_student_type'];
    $this->configuration['asu_degree_rfi_area_of_interest'] =
      $values['asu_degree_rfi_area_of_interest'];
    $this->configuration['asu_degree_rfi_a_of_i_optional'] =
      $values['asu_degree_rfi_a_of_i_optional'];
    $this->configuration['asu_degree_rfi_program_of_interest'] =
      $values['asu_degree_rfi_program_of_interest'];
    $this->configuration['asu_degree_rfi_p_of_i_optional'] =
      $values['asu_degree_rfi_p_of_i_optional'];
    $this->configuration['asu_degree_rfi_is_cert_minor'] =
      $values['asu_degree_rfi_is_cert_minor'];
    $this->configuration['asu_degree_rfi_country'] =
      $values['asu_degree_rfi_country'];
    $this->configuration['asu_degree_rfi_state_province'] =
      $values['asu_degree_rfi_state_province'];
    $this->configuration['asu_degree_rfi_success_msg'] =
      $values['asu_brand_header_success_msg'];
    $this->configuration['asu_degree_rfi_test'] =
      $values['asu_degree_rfi_test'];
  }

}
