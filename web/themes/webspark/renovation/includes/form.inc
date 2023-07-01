<?php
/**
 * @file
 * Theme and preprocess functions for forms.
 */

use Drupal\Core\Form\FormStateInterface;

function renovation_form_alter(&$form, &$form_state, $form_id) {
  // Add classes to cancel button on Layout Builder discard/revert changes.
  if ($form_id == 'layout_builder_discard_changes' || $form_id == 'layout_builder_revert_overrides') {
    $form['actions']['cancel']['#attributes']['class'][] = 'btn btn-dark';

    // Changes in the revert form wording.
    if ($form_id == 'layout_builder_revert_overrides') {
      $form['#title'] = t('Are you sure you want to revert this page to defaults, which will delete all content on this page?');
      $form['actions']['submit']['#value'] = t('Confirm');
    }
  }

  // Add the class required for all the forms in front theme.
  $form['#attributes']['class'][] = 'uds-form';
}

/**
 * Implements hook_preprocess_HOOK().
 */
function renovation_preprocess_input__submit(&$variables) {
  // Adds class to submit buttons.
  $variables['attributes']['class'][] = 'btn-maroon';
}

/**
 * Add description text to media item dialogs regarding Remote Videos.
 * Add additional fields for configuring media items of type 'image'.
 *
 * @param array $form
 * @param FormStateInterface $form_state
 * @return void
 */
function renovation_form_editor_media_dialog_alter(array &$form, FormStateInterface $form_state) {
  $form['align']['#description'] = t('Alignment options do not affect Remote Videos.');

  if (isset($form_state->getUserInput()['editor_object'])) {
    $editor_object = $form_state->getUserInput()['editor_object'];
    $media_embed_element = $editor_object['attributes'];
  }
  else {
    // Retrieve the user input from form state.
    $media_embed_element = $form_state->get('media_embed_element');
  }

  $form['spacing_top'] = [
    '#type' => 'select',
    '#title' => t('Spacing top'),
    '#description' => 'Spacing top',
    '#step' => '1',
    '#default_value' => empty($media_embed_element['data-spacing-top']) ? '' : $media_embed_element['data-spacing-top'],
    '#options' => [
      '' => 'None',
      'spacing-top-8' => '8px',
      'spacing-top-16' => '16px',
      'spacing-top-24' => '24px',
    ],
    '#parents' => ['attributes', 'data-spacing-top'],
  ];

  $form['spacing_bottom'] = [
    '#type' => 'select',
    '#title' => t('Spacing bottom'),
    '#description' => 'Spacing bottom',
    '#step' => '1',
    '#default_value' => empty($media_embed_element['data-spacing-bottom']) ? '' : $media_embed_element['data-spacing-bottom'],
    '#options' => [
      '' => 'None',
      'spacing-bottom-8' => '8px',
      'spacing-bottom-16' => '16px',
      'spacing-bottom-24' => '24px',
    ],
    '#parents' => ['attributes', 'data-spacing-bottom'],
  ];

  $form['spacing_left'] = [
    '#type' => 'select',
    '#title' => t('Spacing left'),
    '#description' => 'Spacing left',
    '#step' => '1',
    '#default_value' => empty($media_embed_element['data-spacing-left']) ? '' : $media_embed_element['data-spacing-left'],
    '#options' => [
      '' => 'None',
      'spacing-left-8' => '8px',
      'spacing-left-16' => '16px',
      'spacing-left-24' => '24px',
    ],
    '#parents' => ['attributes', 'data-spacing-left'],
  ];

  $form['spacing_right'] = [
    '#type' => 'select',
    '#title' => t('Spacing right'),
    '#description' => 'Spacing right',
    '#step' => '1',
    '#default_value' => empty($media_embed_element['data-spacing-right']) ? '' : $media_embed_element['data-spacing-right'],
    '#options' => [
      '' => 'None',
      'spacing-right-8' => '8px',
      'spacing-right-16' => '16px',
      'spacing-right-24' => '24px',
    ],
    '#parents' => ['attributes', 'data-spacing-right'],
  ];

  $form['round'] = [
    '#type' => 'checkbox',
    '#title' => t('Round image.'),
    '#description' => 'Round the image corners.',
    '#default_value' => empty($media_embed_element['data-round']) ? '' : $media_embed_element['data-round'],
    '#parents' => ['attributes', 'data-round'],
  ];
}