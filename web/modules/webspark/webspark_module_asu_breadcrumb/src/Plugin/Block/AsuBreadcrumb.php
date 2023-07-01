<?php

namespace Drupal\webspark_module_asu_breadcrumb\Plugin\Block;

use Drupal\system\Plugin\Block\SystemBreadcrumbBlock;
use Drupal\Core\Form\FormStateInterface;

/**
 * Provides an ASU Breadcrumb block.
 *
 * @Block(
 *   id = "webspark_module_asu_breadcrumb",
 *   admin_label = @Translation("ASU Breadcrumb"),
 *   category = @Translation("ASU Breadcrumb")
 * )
 */
class AsuBreadcrumb extends SystemBreadcrumbBlock
{

  /**
   * {@inheritdoc}
   */
  public function blockForm($form, FormStateInterface $form_state)
  {
    $form = parent::blockForm($form, $form_state);

    $config = $this->getConfiguration();

    $form['color'] = [
      '#type' => 'select',
      '#title' => $this->t('Select color'),
      '#options' => [
        'bg-white' => $this->t('White'),
        'bg-gray-1' => $this->t('Gray 1'),
        'bg-gray-2' => $this->t('Gray 2'),
        'bg-gray-7' => $this->t('Gray 7'),
      ],
      '#default_value' => isset($config['color']) ? $config['color'] : 'default',
    ];

    $form['spacing_top'] = [
      '#type' => 'select',
      '#title' => $this->t('Spacing Top'),
      '#options' => [
        'spacing-top-0' => 'None',
        'spacing-top-8' => '8px',
        'spacing-top-16' => '16px',
        'spacing-top-24' => '24px',
        'spacing-top-32' => '32px',
        'spacing-top-48' => '48px',
        'spacing-top-72' => '72px',
        'spacing-top-96' => '96px',
        'spacing-top-minus-8' => '-8px',
        'spacing-top-minus-16' => '-16px',
        'spacing-top-minus-24' => '-24px',
        'spacing-top-minus-32' => '-32px',
        'spacing-top-minus-48' => '-48px',
        'spacing-top-minus-72' => '-72px',
        'spacing-top-minus-96' => '-96px',
      ],
      '#default_value' => isset($config['spacing_top']) ? $config['spacing_top'] : 'spacing-top-0',
      '#description' => $this->t('Add spacing to the top.'),
    ];

    $form['spacing_bottom'] = [
      '#type' => 'select',
      '#title' => $this->t('Spacing Bottom'),
      '#options' => [
        'spacing-bottom-0' => 'None',
        'spacing-bottom-8' => '8px',
        'spacing-bottom-16' => '16px',
        'spacing-bottom-24' => '24px',
        'spacing-bottom-32' => '32px',
        'spacing-bottom-48' => '48px',
        'spacing-bottom-72' => '72px',
        'spacing-bottom-96' => '96px',
        'spacing-bottom-minus-8' => '-8px',
        'spacing-bottom-minus-16' => '-16px',
        'spacing-bottom-minus-24' => '-24px',
        'spacing-bottom-minus-32' => '-32px',
        'spacing-bottom-minus-48' => '-48px',
        'spacing-bottom-minus-72' => '-72px',
        'spacing-top-minus-96' => '-96px',
      ],
      '#default_value' => isset($config['spacing_bottom']) ? $config['spacing_bottom'] : 'spacing-bottom-0',
      '#description' => $this->t('Add spacing to the bottom.'),
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function blockSubmit($form, FormStateInterface $form_state)
  {
    parent::blockSubmit($form, $form_state);
    $values = $form_state->getValues();
    $this->configuration['color'] = $values['color'];
    $this->configuration['spacing_top'] = $values['spacing_top'];
    $this->configuration['spacing_bottom'] = $values['spacing_bottom'];
  }
}
