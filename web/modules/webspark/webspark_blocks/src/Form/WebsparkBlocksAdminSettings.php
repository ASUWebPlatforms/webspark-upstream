<?php

/**
 * @file
 * Contains \Drupal\webspark_blocks\Form\AsuUserAdminSettings.
 */

namespace Drupal\webspark_blocks\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Class AsuUserAdminSettings
 * @package Drupal\asu_user\Form
 */
class WebsparkBlocksAdminSettings extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'webspark_blocks_admin_settings';
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return ['webspark_blocks.settings'];
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {

    // Config for this instance.
    $config = \Drupal::config('webspark_blocks.settings');

    $links = $config->get('webspark_utility_links');


    // Gather the number of names in the form already.
    $num_links = $form_state->get('num_links');
    if ($num_links === NULL) {
      $num_links = $config->get('num_links');
      $form_state->set('num_links', $num_links);
    }

    // We have to ensure that there is at least one name field.
    if ($num_links === NULL) {
      $form_state->set('num_links', 1);
      $num_links = 1;
    }

    $form['#tree'] = TRUE;
    $form['links_fieldset'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('404 Links'),
      '#prefix' => '<div id="names-fieldset-wrapper">',
      '#suffix' => '</div>',
    ];

    for ($i = 0; $i < $num_links; $i++) {
      $form['links_fieldset']['link_fieldset'. $i] = [
        '#type' => 'fieldset',
        '#title' => $this->t('Link'),
      ];
      $form['links_fieldset']['link_fieldset'. $i]['link_url'] = [
        '#type' => 'textfield',
        '#title' => $this->t('Url'),
        '#default_value' => $links[$i]['link_url'],
      ];
      $form['links_fieldset']['link_fieldset'. $i]['link_title'] = [
        '#type' => 'textfield',
        '#title' => $this->t('Link Title'),
        '#default_value' => $links[$i]['link_title'],
      ];

    }

    $form['links_fieldset']['actions'] = [
      '#type' => 'actions',
    ];
    $form['links_fieldset']['actions']['add_name'] = [
      '#type' => 'submit',
      '#value' => $this->t('Add one more'),
      '#submit' => [[$this, 'addOne']],
      '#ajax' => [
        'callback' => [$this, 'addmoreCallback'],
        'wrapper' => 'names-fieldset-wrapper',
      ],
    ];
    // If there is more than one name, add the remove button.
    if ($num_links > 1) {
      $form['links_fieldset']['actions']['remove_name'] = [
        '#type' => 'submit',
        '#value' => $this->t('Remove one'),
        '#submit' => [[$this, 'removeCallback']],
        '#ajax' => [
          'callback' => [$this, 'addmoreCallback'],
          'wrapper' => 'names-fieldset-wrapper',
        ],
      ];
    }

    $form_state->setCached(FALSE);

    return parent::buildForm($form, $form_state);
  }


  /**
   * Callback for both ajax-enabled buttons.
   *
   * Selects and returns the fieldset with the names in it.
   */
  public function addmoreCallback(array &$form, FormStateInterface $form_state) {
    return $form['links_fieldset'];
  }

  /**
   * Submit handler for the "add-one-more" button.
   *
   * Increments the max counter and causes a rebuild.
   */
  public function addOne(array &$form, FormStateInterface $form_state) {
    $num_links = $form_state->get('num_links');
    $add_button = $num_links + 1;
    $form_state->set('num_links', $add_button);
    // Since our buildForm() method relies on the value of 'num_links' to
    // generate 'name' form elements, we have to tell the form to rebuild. If we
    // don't do this, the form builder will not call buildForm().
    $form_state->setRebuild();
  }

  /**
   * Submit handler for the "remove one" button.
   *
   * Decrements the max counter and causes a form rebuild.
   */
  public function removeCallback(array &$form, FormStateInterface $form_state) {
    $num_links = $form_state->get('num_links');
    if ($num_links > 1) {
      $remove_button = $num_links - 1;
      $form_state->set('num_links', $remove_button);
    }
    // Since our buildForm() method relies on the value of 'num_links' to
    // generate 'name' form elements, we have to tell the form to rebuild. If we
    // don't do this, the form builder will not call buildForm().
    $form_state->setRebuild();
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $config = $this->config('webspark_blocks.settings');
    $num_links = $form_state->get('num_links');
    $links = [];
    for ($i = 0; $i < $num_links; $i++) {
      $link_value = $form_state->getValue(['links_fieldset', 'link_fieldset'. $i]);

      $links[$i] = $link_value;
    }
    $config->set('num_links', $num_links);
    $config->set('webspark_utility_links', $links);
    $config->save();
    return parent::submitForm($form, $form_state);
  }

}
