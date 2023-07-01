<?php

namespace Drupal\webspark_utility\Plugin\Field\FieldWidget;

use Drupal\Core\Field\FieldDefinitionInterface;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\link\Plugin\Field\FieldWidget\LinkWidget;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Plugin implementation of the 'link' widget.
 *
 * @FieldWidget(
 *   id = "styled_link",
 *   label = @Translation("CTA Button"),
 *   field_types = {
 *     "link"
 *   }
 * )
 */

class LinkStyledWidget extends LinkWidget implements ContainerFactoryPluginInterface {

  /**
   * Constructs a LinkWithAttributesWidget object.
   *
   * @param string $plugin_id
   *   The plugin_id for the widget.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\Core\Field\FieldDefinitionInterface $field_definition
   *   The definition of the field to which the widget is associated.
   * @param array $settings
   *   The widget settings.
   * @param array $third_party_settings
   *   The link attributes manager.
   */
  public function __construct(
    $plugin_id,
    $plugin_definition,
    FieldDefinitionInterface $field_definition,
    array $settings,
    array $third_party_settings
  ) {
    parent::__construct($plugin_id, $plugin_definition, $field_definition, $settings, $third_party_settings);
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $plugin_id,
      $plugin_definition,
      $configuration['field_definition'],
      $configuration['settings'],
      $configuration['third_party_settings']
    );
  }

  /**
   * {@inheritdoc}
   */
  public static function defaultSettings() {
    return [
        'placeholder_url' => '',
        'placeholder_title' => '',
        'available_styles' => array_keys(self::getStyleOptions()),
        'allow_style_selection' => TRUE,
        'default_style' => 'btn-dark btn',
        'size' => 'btn-default',
      ] + parent::defaultSettings();
  }

  /**
   * {@inheritdoc}
   */
  public function formElement(FieldItemListInterface $items, $delta, array $element, array &$form, FormStateInterface $form_state) {
    $element = parent::formElement($items, $delta, $element, $form, $form_state);
    $item = $items[$delta];

    $options = $item->get('options')->getValue();
    $targets_available = self::getTargetOptions();

    $default_value = !empty($options['attributes']['target']) ? $options['attributes']['target'] : '';
    $element['options']['attributes']['target'] = [
      '#type' => 'select',
      '#title' => $this->t('Select a target'),
      '#options' => ['' => $this->t('- None -')] + $targets_available,
      '#default_value' => $default_value,
      '#description' => $this->t('Select a link behavior. <em>_self</em> will open the link in the current window. <em>_blank</em> will open the link in a new window or tab. <em>_parent</em> and <em>_top</em> will generally open in the same window or tab, but in some cases will open in a different window.'),
    ];

    $size = $this->getSetting('size');
    $style_options =  self::getStyleOptions($size);
    if ($this->getSetting('available_styles')) {
      $style_options = array_intersect_key($style_options, array_filter($this->getSetting('available_styles')));
    }

    if ($this->getSetting('allow_style_selection')) {
      $default_class = !empty($options['attributes']['class']) ? $options['attributes']['class'] : $this->getSetting('default_style');

      $element['options']['attributes']['class'] = [
        '#type' => 'select',
        '#required' => TRUE,
        '#title' => $this->t('Style'),
        '#options' => $style_options,
        '#default_value' => $default_class,
      ];
    }
    else {
      $element['options']['attributes']['class'] = [
        '#type' => 'hidden',
        '#value' => $this->getSetting('default_style'),
      ];
    }

    return $element;
  }

  /**
   * {@inheritdoc}
   */
  public function settingsForm(array $form, FormStateInterface $form_state) {
    $elements = parent::settingsForm($form, $form_state);

    $elements['allow_style_selection'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Allow Editors Selecting CTA style'),
      '#default_value' => $this->getSetting('allow_style_selection'),
    ];

    $size = $this->getSetting('size');
    $style_options = self::getStyleOptions($size);

    $default = array_filter($this->getSetting('available_styles')) ?: array_keys($style_options);
    $elements['available_styles'] = [
      '#type' => 'checkboxes',
      '#required' => TRUE,
      '#title' => $this->t('Available Styles'),
      '#options' => $style_options,
      '#default_value' => $default,
    ];

    $elements['default_style'] = [
      '#type' => 'select',
      '#required' => TRUE,
      '#title' => $this->t('Style'),
      '#options' => $style_options,
      '#default_value' => $this->getSetting('default_style'),
    ];

    $size_options = self::getSizeOptions();
    $elements['size'] = [
      '#type' => 'select',
      '#required' => TRUE,
      '#title' => $this->t('Size'),
      '#options' => $size_options,
      '#default_value' => $this->getSetting('size'),
    ];

    return $elements;
  }

  private static function getStyleOptions($size = '') {
    return [
      $size . ' btn-gold btn' => t('Gold'),
      $size . ' btn-maroon btn' => t('Maroon'),
      $size . ' btn-gray btn' => t('Gray 2'),
      $size . ' btn-dark btn' => t('Gray 7'),
    ];
  }

  private static function getTargetOptions($size = '') {
    return [
      '_self' => t('Current window (_self)'),
      '_blank' => t('New window (_blank)'),
      'parent' => t('Parent window (_parent)'),
      'top' => t('Topmost window (_top)'),
    ];
  }

  private static function getSizeOptions() {
    return [
      'btn-default' => t('Default'),
      'btn-md' => t('Medium'),
      'btn-sm' => t('Small'),
    ];
  }

}
