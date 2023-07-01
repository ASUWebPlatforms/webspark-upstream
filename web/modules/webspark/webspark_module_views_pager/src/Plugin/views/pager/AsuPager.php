<?php

namespace Drupal\webspark_module_views_pager\Plugin\views\pager;

use Drupal\Core\Form\FormStateInterface;
use Drupal\views\Plugin\views\pager\Full;

/**
 * The plugin to handle mini pager.
 *
 * @ingroup views_pager_plugins
 *
 * @ViewsPager(
 *   id = "asu_pager",
 *   title = @Translation("Paged output, ASU pager"),
 *   short_title = @Translation("ASU"),
 *   help = @Translation("A configurablee pager containing previous and next links."),
 *   theme = "asu_pager",
 * )
 */
class AsuPager extends Full {

  /**
   * Overrides \Drupal\views\Plugin\views\pager\PagerPlugin::defineOptions().
   *
   * Provides sane defaults for the next/previous links.
   */
  public function defineOptions() {
    $options = parent::defineOptions();
    // Empty Initial options

    $options['alignment'] = ['default' => 'center'];
    $options['show_ellipses'] = ['default' => 0];
    $options['show_active'] = ['default' => 1];
    $options['show_last'] = ['default' => 0];
    $options['color'] = ['default' => 'default'];
    $options['border'] = ['default' => 0];
    $options['show_icons'] = ['default' => 1];
    return $options;
  }

  /**
   * {@inheritdoc}
   */
  public function buildOptionsForm(&$form, FormStateInterface $form_state) {
    parent::buildOptionsForm($form, $form_state);

    $form['show_active'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Show active element'),
      '#description' => $this->t('Show the element which is currently active.'),
      '#default_value' => $this->options['show_active'],
    ];

    $form['show_ellipses'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Show ellipsis'),
      '#description' => $this->t('Show ... after the last item if there are more pages than allowed to be displayed.'),
      '#default_value' => $this->options['show_ellipses'],
    ];

    $form['show_last'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Show last page'),
      '#description' => $this->t('Show last page when there are more pages than shown in the pager.'),
      '#default_value' => $this->options['show_last'],
    ];

    $form['border'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Add border'),
      '#description' => $this->t('Display a border around the pager.'),
      '#default_value' => $this->options['border'],
    ];

    $form['color'] = [
      '#type' => 'select',
      '#title' => $this->t('Select colour'),
      '#description' => $this->t('Select the colour way for the pager.'),
      '#options' => [
        'default' => $this->t('Default'),
        'uds-bg-gray' => $this->t('Gray'),
        'uds-bg-dark' => $this->t('Dark'),
      ],
      '#default_value' => $this->options['color'],
    ];

    $form['alignment'] = [
      '#type' => 'select',
      '#title' => $this->t('ASU pager alignment'),
      '#description' => $this->t('Select the ASU pager style.'),
      '#options' => [
        'left' => $this->t('Left'),
        'right' => $this->t('Right'),
        'center' => $this->t('Center'),
      ],
      '#default_value' => $this->options['alignment'],
    ];

    $form['show_icons'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Show icons'),
      '#description' => $this->t('Show left/right arrows on Prev and Next links.'),
      '#default_value' => $this->options['show_icons'],
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function summaryTitle() {
    if (!empty($this->options['offset'])) {
      return $this->formatPlural(
        $this->options['items_per_page'],
        'Asu pager, @count item, skip @skip',
        'Asu pager, @count items, skip @skip',
        [
          '@count' => $this->options['items_per_page'],
          '@skip' => $this->options['offset'],
        ]
      );
    }
    return $this->formatPlural(
      $this->options['items_per_page'],
      'Asu pager, @count item',
      'Asu pager, @count items',
      [
        '@count' => $this->options['items_per_page']
      ]
    );
  }

  /**
   * {@inheritdoc}
   */
  public function render($input) {

    // The 0, 1, 3, 4 indexes are correct. See the template_preprocess_pager()
    // documentation.
    $tags = [
      0 => $this->options['tags']['first'],
      1 => $this->options['tags']['previous'],
      3 => $this->options['tags']['next'],
      4 => $this->options['tags']['last'],
    ];

    return [
      '#theme' => $this->themeFunctions(),
      '#tags' => $tags,
      '#element' => $this->options['id'],
      '#parameters' => $input,
      '#alignment' => $this->options['alignment'],
      '#quantity' =>  $this->options['quantity'],
      '#route_name' => !empty($this->view->live_preview) ? '<current>' : '<none>',
      '#show_active' => $this->options['show_active'],
      '#show_last' => $this->options['show_last'],
      '#show_elllipses' => $this->options['show_ellipses'],
      '#border' => $this->options['border'],
      '#color' => $this->options['color'],
      '#show_icons' => $this->options['show_icons'],
    ];
  }

}
