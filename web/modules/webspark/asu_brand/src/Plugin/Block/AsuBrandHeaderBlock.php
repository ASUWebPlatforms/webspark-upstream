<?php /** @noinspection SqlDialectInspection */

/** @noinspection SqlNoDataSourceInspection */

namespace Drupal\asu_brand\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Menu\MenuTreeParameters;
use Drupal\Core\Cache\Cache;
use Drupal\Component\Utility\Html;
use Drupal\Component\Utility\UrlHelper;
use Drupal\Core\Url;

/**
 * Provides the ASU brand header block which deploys the component header.
 *
 * @Block(
 *   id = "asu_brand_header",
 *   admin_label = @Translation("ASU brand header"),
 *   category = @Translation("ASU brand"),
 * )
 */
class AsuBrandHeaderBlock extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {

    // Pass data from php:
    // https://codimth.com/blog/web/drupal/passing-data-php-javascript-drupal-8

    // Pull in block-level configs (see blockForm()). Drupal manages deltas.
    $config = $this->getConfiguration();

    // Rally props to pass to JS as drupalSettings.
    $props = [];
    $props['baseUrl'] = $config['asu_brand_header_block_base_url'] ?? $this->getBaseUrl();
    $props['title'] = $config['asu_brand_header_block_title'];
    $props['parentOrg'] = $config['asu_brand_header_block_parent_org'];
    $props['parentOrgUrl'] = $config['asu_brand_header_block_parent_org_url'];
    $props['expandOnHover'] = $config['asu_brand_header_block_expand_on_hover'];
    $props['loginLink'] = $config['asu_brand_header_block_login_path'];
    $props['logoutLink'] = $config['asu_brand_header_block_logout_path'];
    // TODO Further refine? There are styling issues w buttons IN the component.
    //      For now, we hardcode the colors that look best.
    if ($config['asu_brand_header_block_cta1_url']) {
      $props['buttons'][] = [
        "href" => $config['asu_brand_header_block_cta1_url'],
        "text" => $config['asu_brand_header_block_cta1_label'],
        //"size" => "medium",
        "color" => $config['asu_brand_header_block_cta1_style']
      ];
    }
    if ($config['asu_brand_header_block_cta2_url']) {
      $props['buttons'][] = [
        "href" => $config['asu_brand_header_block_cta2_url'],
        "text" => $config['asu_brand_header_block_cta2_label'],
        //"size" => "medium",
        "color" => $config['asu_brand_header_block_cta2_style']
      ];
    }

    // Override component's default behavior for logged in/out detection to
    // rely on Drupal instead, via passing in props.
    if ($config['asu_brand_header_block_sync_session']) {
      $current_uid = \Drupal::currentUser()->id();
      if ($current_uid > 0) {
        $props['loggedIn'] = TRUE;
        // If we have the SSONAME cookie, use that name. Fallback to
        // "You are logged in" since using the username results in cache issues
        // given the per-role cache. Caching per user causes the header to
        // break for some reason. See also JS solve we have as a backup for
        // when Pantheon strips cookies, in asu_brand.header.js.
        $props['userName'] = isset($_COOKIE['SSONAME']) ? Html::escape($_COOKIE['SSONAME']) : t('You are logged in');
      } else { // Force header to match Drupal login state even if there's an SSO session.
        $props['loggedIn'] = FALSE;
        $props['userName'] = '';
      }
    }

    // Build navTree prop if menu insert is enabled in block config.
    $navTree = [];
    if ($config['asu_brand_header_block_menu_enabled']) {
      $navTree = $this->getNavTree($config['asu_brand_header_block_menu_name']);
    }
    $props['navTree'] = $navTree;

    if (!empty($config['asu_brand_header_block_partner_enabled'])) {
      $props['isPartner'] = TRUE;

      $props['partnerLogo'] = [];

      if (!empty($config['asu_brand_header_block_partner_url'])) {
        $props['partnerLogo']['brandLink'] = $config['asu_brand_header_block_partner_url'];
      }

      if (!empty($config['asu_brand_header_block_partner_logo_url'])) {
        $props['partnerLogo']['src'] = $config['asu_brand_header_block_partner_logo_url'];
      }

      if (!empty($config['asu_brand_header_block_partner_logo_alt'])) {
        $props['partnerLogo']['alt'] = $config['asu_brand_header_block_partner_logo_alt'];
      }
    }
    //Logo images.
    $app_path_folder = $this->getPathImgFolder();
    $props['logo'] = [
      'alt' => 'Arizona State University',
      // ws2-1305 - Adding title attribute. Note: UDS already provides it, but adding for good measure.
      'title' => 'ASU home page',
      'src' => $app_path_folder . '/arizona-state-university-logo-vertical.png',
      'mobileSrc' => $app_path_folder . '/arizona-state-university-logo.png',
      'brandLink' => 'https://www.asu.edu',
    ];
    // Search settings.
    (array)$urls = \Drupal::service('asu_brand.helper_functions')->getSearchHosts();
    $props['searchUrl'] = $urls['asu_search_url'];
    $props['site'] = $urls['url_host'];
    if ($props['site'] === '') { // "opt-out" was selected
      unset($props['site']);
    }

    $block_output = [];
    // Markup containers where components will initialize.
    $block_output['#markup'] =
      $this->t('
        <!-- Cookie Consent component will be initialized in this container. -->
        <div id="ws2CookieConsentContainer" class="cookieConsentContainer"></div>
        <!-- Header component will be initialized in this container. -->
        <div id="ws2HeaderContainer"></div>');
    $tag_menu = $config['asu_brand_header_block_menu_enabled'] ? $config['asu_brand_header_block_menu_name'] : 'main';
    $block_output['#cache'] = [
      'contexts' => $this->getCacheContexts(),
      // Break cache when block or menus change.
      'tags' => Cache::mergeTags($this->getCacheTags(), Cache::buildTags('config:system.menu', [$tag_menu], '.')),
    ];
    // Attach components and helper js registered in asu_brand.libraries.yml
    $block_output['#attached']['library'][] = 'asu_react_core/react-core';
    $block_output['#attached']['library'][] = 'asu_brand/components-library';
    // Pass block configs to javascript. Gets taken up in js/asu_brand.header.js
    $block_output['#attached']['drupalSettings']['asu_brand']['props'] = $props;
    // Get and pass cookie consent status, too.
    $global_config = \Drupal::config('asu_brand.settings');
    $block_output['#attached']['drupalSettings']['asu_brand']['cookie_consent'] = $global_config->get('asu_brand.asu_brand_cookie_consent_enabled');

    return $block_output;
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheContexts() {
    // TODO We should really only use the user context due to our current
    // username fallback above, but that breaks the component for some reason.
    return Cache::mergeContexts(parent::getCacheContexts(), ['user.roles']);
  }

  /**
   * {@inheritdoc}
   */
  public function blockForm($form, FormStateInterface $form_state) {
    $form = parent::blockForm($form, $form_state);

    // Get system menu options.
    $menu_options = array_map(function ($menu) { return $menu->label(); }, \Drupal\system\Entity\Menu::loadMultiple());
    asort($menu_options);

    // Currently unimplemented config items for props:
    // logo TODO for future dev
    // expandOnHover TODO for future dev
    // mobileNavTree TODO for future dev
    // breakpoint TODO for future dev
    // animateTitle TODO for future dev

    // We localize most header settings to the block form to better support
    // microsites and subsites.

    // Config for this instance.
    $config = $this->getConfiguration();

    // Titles (Main, Parent)
    $form['titles'] = array(
      '#type' => 'details',
      '#title' => $this->t('Site titles'),
      '#open' => TRUE,
      '#collapsible' => FALSE
    );
    $form['titles']['asu_brand_header_block_title'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Site title'),
      '#description' => $this->t('Main site title in white ASU header.'),
      '#default_value' => $config['asu_brand_header_block_title'] ?? \Drupal::config('system.site')->get('name'),
      '#required' => TRUE
    ];
    $form['titles']['asu_brand_header_block_base_url'] = [
      '#type' => 'url',
      '#title' => $this->t('Site URL'),
      '#description' => $this->t("URL of this site's home page."),
      '#default_value' => $config['asu_brand_header_block_base_url'] ?? $this->getBaseUrl(),
      '#required' => TRUE
    ];
    $form['titles']['asu_brand_header_block_parent_org'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Parent unit name'),
      '#description' => $this->t("(optional) Name of the ASU parent unit. Will appear above the site title. Leave blank if none."),
      '#default_value' => $config['asu_brand_header_block_parent_org'] ?? '',
      '#states' => array(
        'required' => array(
          ':input[name="settings[titles][asu_brand_header_block_parent_org_url]"]' => array(
            'filled' => TRUE,
          ),
        ),
      ),
    ];
    $form['titles']['asu_brand_header_block_parent_org_url'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Parent department URL'),
      '#description' => $this->t('Absolute or relative URL of the parent unit. Leave blank if none.'),
      '#default_value' => $config['asu_brand_header_block_parent_org_url'] ?? '',
    ];


    $form['menus'] = array(
      '#type' => 'details',
      '#title' => $this->t('Menu settings'),
      '#open' => TRUE,
      '#collapsible' => FALSE
    );
    // Menu settings
    $form['menus']['asu_brand_header_block_menu_enabled'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Insert menu into ASU header'),
      '#description' => $this->t('Insert a site menu into the ASU header and display it responsively. Important note: the first enabled' .
        ' menu link will always be treated as the home menu link and will be converted into a home icon. To change which menu link' .
        ' is used as home, reorder your menu links.'),
      '#default_value' => $config['asu_brand_header_block_menu_enabled'] ?? 1,
    ];
    $form['menus']['asu_brand_header_block_menu_name'] = [
      '#type' => 'select',
      '#title' => $this->t('Menu to insert'),
      '#description' => $this->t('Select the menu to insert.'),
      '#options' => $menu_options,
      '#default_value' => $config['asu_brand_header_block_menu_name'] ?? 'main',
      '#states' => array(
        // Display this field when the menu is enabled.
        'visible' => array(
          ':input[name="settings[asu_brand_header_block_menu_enabled]"]' => array(
            'checked' => TRUE,
          ),
        ),
      ),
    ];
    $form['menus']['asu_brand_header_block_expand_on_hover'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Expand on hover'),
      '#description' => $this->t('If enabled, menu dropdowns will expand on hover. Allows for top-level menu items with children to be clickable as navigation destinations.'),
      '#default_value' => $config['asu_brand_header_block_expand_on_hover'] ?? 0,
      '#states' => array(
        // Display this field when the menu is enabled.
        'visible' => array(
          ':input[name="settings[asu_brand_header_block_menu_enabled]"]' => array(
            'checked' => TRUE,
          ),
        ),
      ),
    ];

    // CTA buttons
    $style_options = [
      'gold' => 'Gold',
      'maroon' => 'Maroon',
      'light' => 'Gray 2',
      'dark' => 'Gray 7',
    ];
    $form['cta'] = array(
      '#type' => 'details',
      '#title' => $this->t('Call To Action buttons'),
      '#description' => 'If desired, add one or two CTA buttons to the right hand side of the main site menu.',
      '#open' => FALSE,
      '#collapsible' => TRUE
    );
    // Button 1
    $form['cta']['cta1'] = array(
      '#type' => 'details',
      '#title' => $this->t('Button 1'),
      '#open' => TRUE,
      '#collapsible' => FALSE
    );
    $form['cta']['cta1']['asu_brand_header_block_cta1_label'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Text'),
      '#default_value' => $config['asu_brand_header_block_cta1_label'] ?? '',
    ];
    $form['cta']['cta1']['asu_brand_header_block_cta1_url'] = [
      '#type' => 'textfield',
      '#title' => $this->t('URL target'),
      '#default_value' => $config['asu_brand_header_block_cta1_url'] ?? '',
      '#states' => array(
        // Require this field when the label is filled.
        'required' => array(
          ':input[name="settings[cta][cta1][asu_brand_header_block_cta1_label]"]' => array(
            'filled' => TRUE,
          ),
        ),
      ),
    ];
    $form['cta']['cta1']['asu_brand_header_block_cta1_style'] = [
      '#type' => 'select',
      '#title' => $this->t('Style'),
      '#default_value' => $config['asu_brand_header_block_cta1_style'] ?? '',
      '#options' => $style_options,
    ];
    // Button 2
    $form['cta']['cta2'] = array(
      '#type' => 'details',
      '#title' => $this->t('Button 2'),
      '#open' => TRUE,
      '#collapsible' => FALSE
    );
    $form['cta']['cta2']['asu_brand_header_block_cta2_label'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Text'),
      '#default_value' => $config['asu_brand_header_block_cta2_label'] ?? '',
    ];
    $form['cta']['cta2']['asu_brand_header_block_cta2_url'] = [
      '#type' => 'textfield',
      '#title' => $this->t('URL target'),
      '#default_value' => $config['asu_brand_header_block_cta2_url'] ?? '',
      '#states' => array(
        // Require this field when the label is filled.
        'required' => array(
          ':input[name="settings[cta][cta2][asu_brand_header_block_cta2_label]"]' => array(
            'filled' => TRUE,
          ),
        ),
      ),
    ];
    $form['cta']['cta2']['asu_brand_header_block_cta2_style'] = [
      '#type' => 'select',
      '#title' => $this->t('Style'),
      '#default_value' => $config['asu_brand_header_block_cta2_style'] ?? '',
      '#options' => $style_options,
    ];

    // Partner header
    $form['partner'] = [
      '#type' => 'details',
      '#title' => $this->t('ASU Partner Header'),
      '#collapsible' => TRUE,
      '#collapsed' => TRUE,
      '#description' => $this->t('<strong>Important</strong>: Use of the Partner Header must first be approved by the ASU Marketing Hub. Do not enable if you have not first received approval. Otherwise, leave this section blank.'),
    ];
    $form['partner']['asu_brand_header_block_partner_enabled'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Is Partner?'),
      '#default_value' => !empty($config['asu_brand_header_block_partner_enabled']) ?
        $config['asu_brand_header_block_partner_enabled'] : 0,
    ];
    $form['partner']['asu_brand_header_block_partner_url'] = [
      '#type' => 'url',
      '#title' => $this->t('Partner URL'),
      '#description' => $this->t('URL of the partner unit. Absolute URLs only.'),
      '#default_value' => !empty($config['asu_brand_header_block_partner_url']) ?
        $config['asu_brand_header_block_partner_url'] : '',
      '#states' => [
        'required' => [
          ':input[name="settings[partner][asu_brand_header_block_partner_enabled]"]' => ['checked' => TRUE],
        ],
      ],
    ];
    $form['partner']['asu_brand_header_block_partner_logo_url'] = [
      '#type' => 'url',
      '#title' => $this->t('Partner Logo URL'),
      '#description' => $this->t('URL of the partner logo image. Absolute URLs only.'),
      '#default_value' => !empty($config['asu_brand_header_block_partner_logo_url']) ?
        $config['asu_brand_header_block_partner_logo_url'] : '',
      '#states' => [
        'required' => [
          ':input[name="settings[partner][asu_brand_header_block_partner_enabled]"]' => ['checked' => TRUE],
        ],
      ],
    ];
    $form['partner']['asu_brand_header_block_partner_logo_alt'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Partner Logo Alt'),
      '#description' => $this->t('The ALT attribute of the partner logo image.'),
      '#default_value' => !empty($config['asu_brand_header_block_partner_logo_alt']) ?
        $config['asu_brand_header_block_partner_logo_alt'] : '',
      '#states' => [
        'required' => [
          ':input[name="settings[partner][asu_brand_header_block_partner_enabled]"]' => ['checked' => TRUE],
        ],
      ],
    ];


    // Login URLs
    $form['logins'] = array(
      '#type' => 'details',
      '#collapsible' => TRUE,
      '#collapsed' => TRUE,
      '#description' => $this->t('Menu routing paths that trigger logons/logoffs (usually CAS-related in Webspark). ' .
      'Do not change these settings unless you know what you are doing.'),
      '#title' => $this->t('Login Paths')
    );
    $form['logins']['asu_brand_header_block_login_path'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Login path'),
      '#default_value' => $config['asu_brand_header_block_login_path'] ?? '/caslogin',
      '#description' => $this->t('Use /caslogin as the recommended CAS default'),
      '#required' => TRUE
    ];
    $form['logins']['asu_brand_header_block_logout_path'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Logout path'),
      '#default_value' => $config['asu_brand_header_block_logout_path'] ?? '/caslogout',
      '#description' => $this->t("Use /caslogout as the recommended CAS default"),
      '#required' => TRUE
    ];
    $form['logins']['asu_brand_header_block_sync_session'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Sync login status with Drupal session'),
      '#description' => $this->t('Recommended. Keeps the header\'s login/out
        status synced with the users\'s Drupal session. If disabled, the header
        will reflect the user\'s single-sign on status and they may become
        confused about whether they are logged in or not.'),
      '#default_value' => $config['asu_brand_header_block_sync_session'] ?? 1,
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function blockValidate($form, FormStateInterface $form_state) {
    $url = $form_state->getValue('asu_brand_header_block_parent_org_url');
    if (empty($url)) {
      return $form_state;
    } else {
      $abs = strpos($url, '://') !== FALSE;
      if (UrlHelper::isValid($url, $abs) !== TRUE) {
        $form_state->setErrorByName('asu_brand_header_block_parent_org_url', $this->t('Parent Org URL is not a valid URL.'));
      }
    }
    return $form_state;
  }

  /**
   * {@inheritdoc}
   */
  public function blockSubmit($form, FormStateInterface $form_state) {
    parent::blockSubmit($form, $form_state);
    $values = $form_state->getValues();

    $this->configuration['asu_brand_header_block_title'] =
      $values['titles']['asu_brand_header_block_title'];
    $this->configuration['asu_brand_header_block_base_url'] =
      $values['titles']['asu_brand_header_block_base_url'];
    $this->configuration['asu_brand_header_block_parent_org'] =
      $values['titles']['asu_brand_header_block_parent_org'];
    $this->configuration['asu_brand_header_block_parent_org_url'] =
      $values['titles']['asu_brand_header_block_parent_org_url'];

    $this->configuration['asu_brand_header_block_cta1_label'] =
      $values['cta']['cta1']['asu_brand_header_block_cta1_label'];
    $this->configuration['asu_brand_header_block_cta1_url'] =
      $values['cta']['cta1']['asu_brand_header_block_cta1_url'];
    $this->configuration['asu_brand_header_block_cta1_style'] =
      $values['cta']['cta1']['asu_brand_header_block_cta1_style'];
    $this->configuration['asu_brand_header_block_cta2_label'] =
      $values['cta']['cta2']['asu_brand_header_block_cta2_label'];
    $this->configuration['asu_brand_header_block_cta2_url'] =
      $values['cta']['cta2']['asu_brand_header_block_cta2_url'];
    $this->configuration['asu_brand_header_block_cta2_style'] =
      $values['cta']['cta2']['asu_brand_header_block_cta2_style'];

    $this->configuration['asu_brand_header_block_menu_enabled'] =
      $values['menus']['asu_brand_header_block_menu_enabled'];
    $this->configuration['asu_brand_header_block_menu_name'] =
      $values['menus']['asu_brand_header_block_menu_name'];
    $this->configuration['asu_brand_header_block_expand_on_hover'] =
      $values['menus']['asu_brand_header_block_expand_on_hover'];

    $this->configuration['asu_brand_header_block_partner_enabled'] =
      $values['partner']['asu_brand_header_block_partner_enabled'];
    $this->configuration['asu_brand_header_block_partner_url'] =
      $values['partner']['asu_brand_header_block_partner_url'];
    $this->configuration['asu_brand_header_block_partner_logo_url'] =
      $values['partner']['asu_brand_header_block_partner_logo_url'];
    $this->configuration['asu_brand_header_block_partner_logo_alt'] =
      $values['partner']['asu_brand_header_block_partner_logo_alt'];

    $this->configuration['asu_brand_header_block_login_path'] =
      $values['logins']['asu_brand_header_block_login_path'];
    $this->configuration['asu_brand_header_block_logout_path'] =
      $values['logins']['asu_brand_header_block_logout_path'];
    $this->configuration['asu_brand_header_block_sync_session'] =
      $values['logins']['asu_brand_header_block_sync_session'];

  }

  /**
   * Build menu array for inclusion in header component navTree prop.
   *
   * @param array $menu_name A menu tree's machine name.
   */
  function getNavTree($menu_name) {

    $menu_tree = \Drupal::menuTree();
    // Load the entire tree.
    $parameters = new MenuTreeParameters();
    // Limit to enabled items.
    $parameters->onlyEnabledLinks();

    // Optionally set active trail.
    $menu_active_trail = \Drupal::service('menu.active_trail')->getActiveTrailIds($menu_name);
    $parameters->setActiveTrail($menu_active_trail);

    // Load the tree based on this set of parameters.
    $tree = $menu_tree->load($menu_name, $parameters);
    // Transform the tree using the manipulators you want.
    $manipulators = [
      // Only show links that are accessible for the current user.
      ['callable' => 'menu.default_tree_manipulators:checkAccess'],
      // Use the default sorting of menu links.
      ['callable' => 'menu.default_tree_manipulators:generateIndexAndSort'],
    ];
    $tree = $menu_tree->transform($tree, $manipulators);
    // Finally, build a renderable array from the transformed tree.
    $menu_tmp = $menu_tree->build($tree);
    $navTree = [];
    foreach ($menu_tmp['#items'] as $item) {

      // BUILD LEVEL 2 first, if extant, to put under parent.
      $childItems = [];
      $childTrayButtons = [];
      $childItemCols = [];
      if (!empty($item['below'])) {
        foreach ($item['below'] as $child) {

          // Get values from menu link custom fields we have added.
          $child_link_custom_values = $this->getMenuLinkCustomValues($child['original_link']);

          // Note on buttons: In childItems, we have two types of buttons:
          // 1. column buttons, denoted by childItem's link_type
          // 2. dropdown tray buttons, denoted by childItem's is_button flag

          if ($child_link_custom_values['is_button']) {
            // Dropdown tray buttons and
            $childTrayButtons[] = [
              'href' => $child['url']->toString(),
              'text' => $child['title'],
              'color' => $child_link_custom_values['button_color'],
            ];
          } else {
            // Set all other menu link childItems, including link_type's:
            // heading && button
            $childItems[] = [
              'href' => $child['url']->toString(),
              'text' => $child['title'],
              'type' => $child_link_custom_values['link_type'],
            ];
          }
        }

        // Sort child items into column formatting for navTree prop.
        $childItemCols = $this->sortChildLinksToCols($childItems);
      }

      // Get values from menu link custom fields we have added.
      // $item_link_custom_values = $this->getMenuLinkCustomValues($item['original_link']);

      // BUILD LEVEL 1
      $navTree[] = [
        'href' => $item['url']->toString(),
        'text' => $item['title'],
        'items' => !empty($item['below']) ? $childItemCols : '',
        'buttons' => !empty($childTrayButtons) ? $childTrayButtons : '',
      ];
    }
    // First item always becomes Home icon.
    $navTree[0]['type'] = 'icon-home';
    $navTree[0]['class'] = 'home';

    return $navTree;
  }


  /**
   * Helper function to get custom menu link field values.
   */
  private function getMenuLinkCustomValues($link) {

    // Get custom fields we've added to menu links using the following approach
    // https://drupal.stackexchange.com/questions/235754/get-menu-link-item-from-menulinktreeelement
    // Maybe not the most OO way to go, but it works.
    $link_type = null;
    $is_button = null;
    $button_color = null;
    if ($link instanceof \Drupal\menu_link_content\Plugin\Menu\MenuLinkContent) {
      $link_uuid = $link->getDerivativeId();
      $link_entity = \Drupal::service('entity.repository')
        ->loadEntityByUuid('menu_link_content', $link_uuid);
      $link_type = $link_entity->menu_link_asu_brand_link_type->value;
      $is_button = $link_entity->menu_link_asu_brand_link_is_button->value;
      $button_color = $link_entity->menu_link_asu_brand_link_button_color->value;
    }

    return ['link_type' => $link_type, 'is_button' => $is_button, 'button_color' => $button_color];
  }

  /**
   * Helper function to sort child menu links array into columns for navTree.
   */
  private function sortChildLinksToCols($childItems) {
    $col = 0;
    $tripwire = false;
    $childItemCols = [];
    foreach ($childItems as $k => $v) {
      // Break out into columns if we have headings or column breaks.
      if ($tripwire && ($v['type'] === "heading" || $v['type'] === "column break")) {
        $col++;
      }
      $childItemCols[$col][] = $v;
      // We want first heading/column to stay in 0, so trigger here.
      // All subsequent passes will use new columns.
      $tripwire = true;
    }
    return $childItemCols;
  }

  /**
   * Returns the base URL string.
   *
   * @return string
   *  The base URL.
   */
  protected function getBaseUrl(): string {
    $config = $this->getConfiguration();

    if (!empty($config['asu_brand_header_block_base_url'])) {
      $out = $config['asu_brand_header_block_base_url'];
    }
    else {
      $out = Url::fromRoute('<front>', [], ['absolute' => TRUE])->toString();
    }

    return $out;
  }

  protected function getPathImgFolder() {
    $module_handler = \Drupal::service('module_handler');
    $path_module = $module_handler->getModule('asu_brand')->getPath();
    $appPathFolder = base_path() . $path_module . '/node_modules/@asu/component-header/dist/assets/img';
    return $appPathFolder;
  }
}
