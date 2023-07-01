<?php

namespace Drupal\webspark_blocks\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Form\FormStateInterface;


/**
 * Provides the ASU footer block which deploys the component footer.
 *
 * @Block(
 *   id = "webspark_links",
 *   admin_label = @Translation("Webspark links"),
 *   category = @Translation("Webspark blocks"),
 * )
 */
class WebsparkBlocksLinks extends BlockBase {


  /**
   * {@inheritdoc}
   */
  public function build() {
    $config = $this->getConfiguration();

    return [
      '#theme' => 'webspark_blocks__search',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function blockForm($form, FormStateInterface $form_state) {
    $form = parent::blockForm($form, $form_state);

    // Config for this instance.
    $config = $this->getConfiguration();

    $links = $config['webspark_blocks_links'];


    $form['description'] = [
      '#type' => 'item',
      '#markup' => $this->t('Add links on the.'),
    ];

    // Gather the number of names in the form already.
    $num_links = $form_state->get('num_links');
    if ($num_links === NULL) {
      $num_links = $config['num_links'];
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
      '#title' => $this->t('Add Links in this block'),
      '#prefix' => '<div id="names-fieldset-wrapper">',
      '#suffix' => '</div>',
    ];

    for ($i = 0; $i < $num_links; $i++) {
      $form['links_fieldset']['link_fieldset'. $i] = [
        '#type' => 'fieldset',
        '#title' => $this->t('Link'),
         ''
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

    return $form;
  }

   /**
   * Callback for both ajax-enabled buttons.
   *
   * Selects and returns the fieldset with the names in it.
   */
  public function addmoreCallback(array &$form, FormStateInterface $form_state) {
    return $form['settings']['links_fieldset'];
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
  public function blockSubmit($form, FormStateInterface $form_state) {
    parent::blockSubmit($form, $form_state);

    $num_links = $form_state->get('num_links');
    $links = [];
    for ($i = 0; $i < $num_links; $i++) {
      $link_value = $form_state->getValue(['links_fieldset', 'link_fieldset'. $i]);

      $links[$i] = $link_value;
    }
    $this->configuration['webspark_blocks_links'] = $links;
    $this->configuration['num_links'] = $num_links;

  }

}
