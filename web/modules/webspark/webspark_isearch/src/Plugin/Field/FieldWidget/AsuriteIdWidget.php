<?php
namespace Drupal\webspark_isearch\Plugin\Field\FieldWidget;

use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\WidgetBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Plugin implementation of the 'directory' widget.
 *
 * @FieldWidget(
 *   id = "field_asurite_id_widget",
 *   module = "webspark_isearch",
 *   label = @Translation("Asurite ids"),
 *   field_types = {
 *     "string"
 *   }
 * )
 */
class AsuriteIdWidget extends WidgetBase {

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
      '#prefix' => '<div id="asurite-tree-options"></div>',
    ];
    // Add the required libraries.
    $element['#attached']['library'][] = 'webspark_isearch/jstree';
    $element['#attached']['library'][] = 'webspark_isearch/asurite_id_field';
    // Make a fieldset which is closed by default.
    $element += array(
      '#type' => 'details',
      '#attributes' => array('class' => array('container-inline')),
      '#open' => FALSE,
    );
    return $element;
  }
}