<?php

namespace Drupal\asu_footer\Plugin\Block;

use Drupal\system\Entity\Menu;
use Drupal\Core\Block\BlockBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Link;
use Drupal\media\Entity\Media;
use Drupal\file\Entity\File;
use Drupal\Core\Url;
use Drupal\Core\Cache\Cache;
use Drupal\Core\File\FileSystemInterface;

/**
 * Provides the ASU footer block which deploys the component footer.
 *
 * @Block(
 *   id = "asu_footer",
 *   admin_label = @Translation("ASU footer"),
 *   category = @Translation("ASU footer"),
 * )
 */
class AsuFooterBlock extends BlockBase {

  const ORDINAL_INDEX = ['second', 'third', 'fourth', 'fifth', 'sixth'];

  /**
   * The total number of stacked menus in a column.
   */
  const STACKED_MENUS = 3;

  /**
   * {@inheritdoc}
   */
  public function build() {
    $config = $this->getConfiguration();

    //Default images.

    $module_handler = \Drupal::service('module_handler');
    $path_module = $module_handler->getModule('asu_footer')->getPath();
    $src_unit_logo = '/' . $path_module . '/img/ASU-EndorsedLogo.png';
    $src_unit_logo_internal = $path_module . '/img/ASU-EndorsedLogo.png';
    list($src_unit_logo_width, $src_unit_logo_height) = getimagesize($src_unit_logo_internal);
    $src_footer_img = '/' . $path_module . '/img/240917_ASU_Rankings_GOLD.png';
    $src_footer_img_internal = $path_module . '/img/240917_ASU_Rankings_GOLD.png';
    list($src_footer_img_width, $src_footer_img_height) = getimagesize($src_footer_img_internal);
    if (!empty($config['asu_footer_block_unit_logo_img'])) {
      $unit_custom_logo = $this->load_unit_logo($config['asu_footer_block_unit_logo_img']);
    }
    $unit_custom_logo_link = 'https://www.asu.edu';
    if (!empty($config['asu_footer_block_logo_link_url'])) {
      $unit_custom_logo_link = $config['asu_footer_block_logo_link_url'];
    }
    $columns_data = [];
    $cache_tags = [];
    //Columns data.
    foreach (static::ORDINAL_INDEX as $index) {
      foreach (range(1, static::STACKED_MENUS) as $stack_id) {
        $title_id = $this->getFieldId($index, $stack_id, 'title');
        $menu_id = $this->getFieldId($index, $stack_id);

        if (!empty($config[$menu_id]) && $config[$menu_id] != '_none') {
          $buf['title'] = $config[$title_id];
          $buf['menu_items'] = $this->get_menu_column($config[$menu_id]);
          $columns_data[$index][] = $buf;
          // Create a list of menu tags that we need to use to invalidate the cache on change.
          $cache_tags[] = Cache::buildTags('config:system.menu', [
            $config[$menu_id]
          ], '.');
        }
      }
    }

    $facebook_url = '';
    if (!empty($config['asu_footer_block_facebook_url'])) {
      $facebook_url = Url::fromUri('https://www.facebook.com/' . $config['asu_footer_block_facebook_url']);
    }
    $twitter_url = '';
   if (!empty($config['asu_footer_block_twitter_url'])) {
      $twitter_url = Url::fromUri('https://twitter.com/' . $config['asu_footer_block_twitter_url']);
    }
    $linkedin_url = '';
    if (!empty($config['asu_footer_block_linkedin_url'])) {
      $linkedin_url = Url::fromUri('https://www.linkedin.com/' . $config['asu_footer_block_linkedin_url']);
    }
    $instagram_ulr = '';
    if (!empty($config['asu_footer_block_instagram_url'])) {
      $instagram_ulr = Url::fromUri('https://www.instagram.com/' . $config['asu_footer_block_instagram_url']);
    }
    $youtube_url = '';
    if (!empty($config['asu_footer_block_youtube_url'])) {
      $youtube_url = Url::fromUri('https://www.youtube.com/' . $config['asu_footer_block_youtube_url']);
    }

    // Merge all the tags.
    $tags = $this->getCacheTags();
    foreach ($cache_tags as $items) {
      $tags = Cache::mergeTags($tags, $items);
    }
    $cache = [
      'contexts' => $this->getCacheContexts(),
      // Break cache when block or menus change.
      'tags' => $tags,
    ];
    $block_output = [];
    $block_output = [
      '#theme' => 'asu_footer__footer_block',
      '#cache' => $cache,
      '#src_unit_logo' => $src_unit_logo,
      '#src_unit_logo_width' => $src_unit_logo_width,
      '#src_unit_logo_height' => $src_unit_logo_height,
      '#unit_custom_logo' => $unit_custom_logo ?? '',
      '#unit_custom_logo_link' => $unit_custom_logo_link,
      '#src_footer_img' => $src_footer_img,
      '#src_footer_img_width' => $src_footer_img_width,
      '#src_footer_img_height' => $src_footer_img_height,
      '#show_logo_social_media' => $config['asu_footer_block_show_logo_social_media'],
      '#facebook_url' => $facebook_url,
      '#twitter_url' => $twitter_url,
      '#linkedin_url' => $linkedin_url,
      '#instagram_ulr' => $instagram_ulr,
      '#youtube_url' => $youtube_url,
      '#show_columns' => $config['asu_footer_block_show_columns'],
      '#unit_name' => $config['asu_footer_block_unit_name'],
      '#columns_data' => $columns_data,
      '#link_title' => $config['asu_footer_block_link_title'],
      '#link_url' => $config['asu_footer_block_link_url'],
      '#cta_title' => $config['asu_footer_block_cta_title'],
      '#cta_url' => $config['asu_footer_block_cta_url'],
    ];

    $block_output['#attached']['library'][] = 'asu_footer/footer-block';
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

    // Config for this instance.
    $config = $this->getConfiguration();

    $form['asu_footer_block_show_logo_social_media'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Show social media and unit logo'),
      '#default_value' => $config['asu_footer_block_show_logo_social_media'],
    ];
    $form['asu_footer_block_unit_logo'] = [
      '#type' => 'details',
      '#title' => t('Unit logo'),
      '#open' => TRUE,
      '#states' => [
        'visible' => [
          ':input[name="settings[asu_footer_block_show_logo_social_media]"]' => [
            'checked' => TRUE,
          ],
        ],
      ],
    ];
    $form['asu_footer_block_unit_logo']['asu_footer_block_unit_logo_img'] = [
      '#type' => 'media_library',
      '#allowed_bundles' => ['image'],
      '#title' => t('Upload Unit logo'),
      '#default_value' => $config['asu_footer_block_unit_logo_img'] ?? '',
      '#states' => [
        'visible' => [
          ':input[name="settings[asu_footer_block_show_logo_social_media]"]' => [
            'checked' => TRUE,
          ],
        ],
      ],
    ];

    $form['asu_footer_block_unit_logo']['asu_footer_block_logo_link_url'] = [
      '#type' => 'textfield',
      '#title'  => t('Logo URL'),
      '#default_value' => $config['asu_footer_block_logo_link_url'] ?? '',
      '#states' => [
        'visible' => [
          ':input[name="settings[asu_footer_block_show_logo_social_media]"]' => [
            'checked' => TRUE,
          ],
        ],
      ],
    ];
    $form['asu_footer_block_facebook_url'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Facebook Social Media'),
      '#field_prefix' => 'https://www.facebook.com/',
      '#size' => 40,
      '#default_value' => $config['asu_footer_block_facebook_url'] ?? '',
      '#states' => [
        'visible' => [
          ':input[name="settings[asu_footer_block_show_logo_social_media]"]' => [
            'checked' => TRUE,
          ],
        ],
      ],
    ];
    $form['asu_footer_block_twitter_url'] = [
      '#type' => 'textfield',
      '#title' => $this->t('X / Twitter Social Media'),
      '#field_prefix' => 'https://twitter.com/',
      '#size' => 40,
      '#default_value' => $config['asu_footer_block_twitter_url'] ?? '',
      '#states' => [
        'visible' => [
          ':input[name="settings[asu_footer_block_show_logo_social_media]"]' => [
            'checked' => TRUE,
          ],
        ],
      ],
    ];
    $form['asu_footer_block_linkedin_url'] = [
      '#type' => 'textfield',
      '#title' => $this->t('LinkedIn Social Media'),
      '#field_prefix' => 'https://www.linkedin.com/',
      '#size' => 40,
      '#default_value' => $config['asu_footer_block_linkedin_url'] ?? '',
      '#states' => [
        'visible' => [
          ':input[name="settings[asu_footer_block_show_logo_social_media]"]' => [
            'checked' => TRUE,
          ],
        ],
      ],
    ];
    $form['asu_footer_block_instagram_url'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Instagram Social Media'),
      '#field_prefix' => 'https://www.instagram.com/',
      '#size' => 40,
      '#default_value' => $config['asu_footer_block_instagram_url'] ?? '',
      '#states' => [
        'visible' => [
          ':input[name="settings[asu_footer_block_show_logo_social_media]"]' =>[
            'checked' => TRUE,
          ],
        ],
      ],
    ];
    $form['asu_footer_block_youtube_url'] = [
      '#type' => 'textfield',
      '#title' => $this->t('YouTube Social Media'),
      '#field_prefix' => 'https://www.youtube.com/',
      '#size' => 40,
      '#default_value' => $config['asu_footer_block_youtube_url'] ?? '',
      '#states' => [
        'visible' => [
          ':input[name="settings[asu_footer_block_show_logo_social_media]"]' => [
            'checked' => TRUE,
          ],
        ],
      ],
    ];

    $form['asu_footer_block_show_columns'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Show columns'),
      '#default_value' => $config['asu_footer_block_show_columns'],
    ];
    $form['asu_footer_block_unit_name'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Name of Unit/School/College'),
      '#description' => $this->t('Site title to appear in the header.'),
      '#default_value' => $config['asu_footer_block_unit_name'] ?? '',
      '#states' => [
        'visible' => [
          ':input[name="settings[asu_footer_block_show_columns]"]' => [
            'checked' => TRUE,
          ],
        ],
        'required' => [
          ':input[name="settings[asu_footer_block_show_columns]"]' => [
            'checked' => TRUE,
          ],
        ],
      ],
    ];
    $form['asu_footer_block_link'] = [
      '#type' => 'details',
      '#title' => t('Link'),
      '#open' => TRUE,
      '#states' => [
        'visible' => [
          ':input[name="settings[asu_footer_block_show_columns]"]' => [
            'checked' => TRUE,
          ],
        ],
      ],
    ];

    $form['asu_footer_block_link']['asu_footer_block_link_title'] = [
      '#type' => 'textfield',
      '#title'  => t('Link Title'),
      '#default_value' => $config['asu_footer_block_link_title'] ?? '',
      '#maxlength' => 60,
      '#states' => [
        'visible' => [
          ':input[name="settings[asu_footer_block_show_columns]"]' => [
            'checked' => TRUE,
          ],
        ],
      ],
    ];

    $form['asu_footer_block_link']['asu_footer_block_link_url'] = [
      '#type' => 'textfield',
      '#title'  => t('URL'),
      '#default_value' => $config['asu_footer_block_link_url'] ?? '',
      '#states' => [
        'visible' => [
          ':input[name="settings[asu_footer_block_show_columns]"]' => [
            'checked' => TRUE,
          ],
        ],
      ],
    ];
    $form['asu_footer_block_cta'] = [
      '#type' => 'details',
      '#title' => t('CTA'),
      '#open' => TRUE,
      '#states' => [
        'visible' => [
          ':input[name="settings[asu_footer_block_show_columns]"]' => [
            'checked' => TRUE,
          ],
        ],
      ],
    ];

    $form['asu_footer_block_cta']['asu_footer_block_cta_title'] = [
      '#type' => 'textfield',
      '#title'  => t('CTA Title'),
      '#default_value' => $config['asu_footer_block_cta_title'] ?? '',
      '#maxlength' => 60,
      '#states' => [
        'visible' => [
          ':input[name="settings[asu_footer_block_show_columns]"]' => [
            'checked' => TRUE,
          ],
        ],
      ],
    ];

    $form['asu_footer_block_cta']['asu_footer_block_cta_url'] = [
      '#type' => 'textfield',
      '#title'  => t('URL'),
      '#default_value' => $config['asu_footer_block_cta_url'] ?? '',
      '#states' => [
        'visible' => [
          ':input[name="settings[asu_footer_block_show_columns]"]' => [
            'checked' => TRUE,
          ],
        ],
      ],
    ];

    // Get system menu options.
    $menu_options = array_map(function ($menu) { return $menu->label(); }, Menu::loadMultiple());
    asort($menu_options);
    foreach (static::ORDINAL_INDEX as $index) {

      $form[$index . '_column'] = [
        '#type' => 'details',
        '#title' => $this->t($index . ' Column menu'),
        '#open' => true,
        '#states' => [
          'visible' => [
            ':input[name="settings[asu_footer_block_show_columns]"]' => [
              'checked' => TRUE,
            ],
          ],
        ],
      ];

      foreach (range(1, static::STACKED_MENUS) as $stack_id) {
        $menu_id = $this->getFieldId($index, $stack_id);
        $title_id = $this->getFieldId($index, $stack_id, 'title');
        $name_suffix = $stack_id > 1 ? "_$stack_id" : '';

        $form[$index . '_column'][$menu_id] = [
          '#type' => 'select',
          '#title' => $this->t('Menu to insert in ' . $index . ' column'),
          '#description' => $this->t('Select the menu to insert.'),
          '#options' => $menu_options,
          '#empty_option' => t('- None -'),
          '#empty_value' => '_none',
          '#default_value' => $config[$menu_id] ?? '',
          '#states' => [
            'visible' => [
              ':input[name="settings[asu_footer_block_show_columns]"]' => [
                'checked' => TRUE,
              ],
            ],
          ],
        ];

        $form[$index . '_column'][$title_id] = [
          '#type' => 'textfield',
          '#title' => $this->t('Menu title'),
          '#default_value' => $config[$title_id] ?? '',
          '#description' => $this->t('Leaving this blank will prevent the form from submitting.'),
          '#states' => [
            'visible' => [
              ":input[name='settings[{$index}_column][asu_footer_block_menu_{$index}_column_name{$name_suffix}]']" => ['!value' => '_none'],
            ],
            'required' => [
              ":input[name='settings[{$index}_column][asu_footer_block_menu_{$index}_column_name{$name_suffix}]']" => ['!value' => '_none'],
            ],
          ]
        ];
      }
    }

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function blockSubmit($form, FormStateInterface $form_state) {
    parent::blockSubmit($form, $form_state);

    $values = $form_state->getValues();
    $this->configuration['asu_footer_block_unit_logo_img'] =
      $values['asu_footer_block_unit_logo']['asu_footer_block_unit_logo_img'];
    $this->configuration['asu_footer_block_logo_link_url'] =
      $values['asu_footer_block_unit_logo']['asu_footer_block_logo_link_url'];
    $this->configuration['asu_footer_block_unit_name'] =
      $values['asu_footer_block_unit_name'];
    $this->configuration['asu_footer_block_show_logo_social_media'] =
      $values['asu_footer_block_show_logo_social_media'];
    $this->configuration['asu_footer_block_facebook_url'] =
      $values['asu_footer_block_facebook_url'];
    $this->configuration['asu_footer_block_twitter_url'] =
      $values['asu_footer_block_twitter_url'];
    $this->configuration['asu_footer_block_linkedin_url'] =
      $values['asu_footer_block_linkedin_url'];
    $this->configuration['asu_footer_block_instagram_url'] =
      $values['asu_footer_block_instagram_url'];
    $this->configuration['asu_footer_block_youtube_url'] =
      $values['asu_footer_block_youtube_url'];
    $this->configuration['asu_footer_block_show_columns'] =
      $values['asu_footer_block_show_columns'];
    $this->configuration['asu_footer_block_link_title'] =
      $values['asu_footer_block_link']['asu_footer_block_link_title'];
    $this->configuration['asu_footer_block_link_url'] =
     $values['asu_footer_block_link']['asu_footer_block_link_url'];
    $this->configuration['asu_footer_block_cta_title'] =
      $values['asu_footer_block_cta']['asu_footer_block_cta_title'];
    $this->configuration['asu_footer_block_cta_url'] =
     $values['asu_footer_block_cta']['asu_footer_block_cta_url'];

    foreach (static::ORDINAL_INDEX as $index) {
      foreach (range(1, static::STACKED_MENUS) as $stack_id) {
        $title_id = $this->getFieldId($index, $stack_id, 'title');
        $menu_id = $this->getFieldId($index, $stack_id);

        $this->configuration[$title_id] = $values[$index . '_column'][$title_id];
        $this->configuration[$menu_id] = $values[$index . '_column'][$menu_id];
      }
    }
  }

  function get_menu_column($menu_name) {
    // Get customer care top level menu.
    $menu_tree = \Drupal::menuTree();
    $parameters = $menu_tree->getCurrentRouteMenuTreeParameters($menu_name);
    $parameters->setMinDepth(0);
    $parameters->onlyEnabledLinks();

    $tree = $menu_tree->load($menu_name, $parameters);
    $manipulators = [
      ['callable' => 'menu.default_tree_manipulators:checkAccess'],
      ['callable' => 'menu.default_tree_manipulators:generateIndexAndSort'],
    ];
    $tree = $menu_tree->transform($tree, $manipulators);

    $menu_items = [];
    // Add menu items to array list.
    foreach ($tree as $item) {
      $title = $item->link->getTitle();
      $url = $item->link->getUrlObject();
      // Send url and title to twig file for rendering
      $menu_items[] = array($url, $title);
    }

    return $menu_items;
  }

  function load_unit_logo($mid) {
    if ($mid) {
      $media = Media::load($mid);
      $fid = $media->field_media_image->target_id;
      $alt = $media->field_media_image->alt;
      $file = File::load($fid);
      // Load main_image
      if ($file) {
        $logo_build = [
          '#theme' => 'image_style',
          '#style_name' => 'footer_logo',
          '#uri' => $file->getFileUri(),
          '#alt' => $alt,
        ];
        // Add the file entity to the cache dependencies.
        // This will clear our cache when this entity updates.
        $renderer = \Drupal::service('renderer');
        $renderer->addCacheableDependency($logo_build, $file);

        // Return the render array as block content.
        return $logo_build;
      }
    }
    return NULL;
  }

  /**
   * Generates a field id.
   *
   * @param string $index_str
   *   The index string.
   * @param int $index
   *   The index number.
   * @param string $type
   *   The field type
   *
   * @return string
   *   The field id.
   */
  protected function getFieldId(string $index_str, int $index, string $type = ''): string {
    $elements = [
      ($type == 'title') ? 'asu_footer_block' : 'asu_footer_block_menu',
      $index_str,
      ($type == 'title') ? 'title' : 'column_name',
    ];

    if ($index > 1) {
      $elements[] = $index;
    }

    return implode('_', $elements);
  }
}
