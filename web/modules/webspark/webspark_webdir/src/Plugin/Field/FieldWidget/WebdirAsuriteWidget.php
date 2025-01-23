<?php
namespace Drupal\webspark_webdir\Plugin\Field\FieldWidget;

use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\WidgetBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Plugin implementation of the 'directory' widget.
 *
 * @FieldWidget(
 *   id = "field_webdir_asurite_widget",
 *   module = "webspark_webdir",
 *   label = @Translation("Webdir Asurite ids"),
 *   field_types = {
 *     "string_long"
 *   }
 * )
 */
class WebdirAsuriteWidget extends WidgetBase {

  /**
   * {@inheritdoc}
   */
  public function formElement(FieldItemListInterface $items, $delta, array $element, array &$form, FormStateInterface $form_state) {
    $value = isset($items[$delta]->value) ? $items[$delta]->value : '';
    // Hidden field that will gather all the data from the jstree.
    $element['value'] = [
      '#type' => 'hidden',
      '#default_value' => $value,
      '#attributes' => array('class' => array('asurite-tree')),
      '#prefix' => '<div id="asurite-tree-options" style="width: 100%" class="ck-reset"></div>',
      '#field_parents' => [
        0 => 'settings',
        1 => 'block_form',
      ],
    ];
    // Add the required libraries.
    $element['#attached']['library'][] = 'webspark_webdir/jstree';
    $element['#attached']['library'][] = 'webspark_webdir/asurite_field';
    // Make a fieldset which is closed by default.
    $element += array(
      '#type' => 'details',
      '#attributes' => array('class' => array('container-inline')),
      '#open' => TRUE,
    );
    return $element;
  }
}
