<?php
namespace Drupal\webspark_webdir\Plugin\Field\FieldWidget;

use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\WidgetBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Plugin implementation of the 'directory' widget.
 *
 * @FieldWidget(
 *   id = "field_webdir_add_widget",
 *   module = "webspark_webdir",
 *   label = @Translation("Webdir add people"),
 *   field_types = {
 *     "string"
 *   }
 * )
 */
class WebdirAddWidget extends WidgetBase {

  /**
   * {@inheritdoc}
   */
  public function formElement(FieldItemListInterface $items, $delta, array $element, array &$form, FormStateInterface $form_state) {
    $value = isset($items[$delta]->value) ? $items[$delta]->value : '';
    // Hidden field that will gather all the data from the jstree.
    $element['value'] = [
      '#type' => 'hidden',
      '#default_value' => $value,
      '#attributes' => array('class' => array('asurite-add')),
      '#prefix' => '<div id="asurite-add-options" style="width: 100%" class="ck-reset"></div>',
      '#field_parents' => [
        0 => 'settings',
        1 => 'block_form',
      ],
    ];
    // Add the required libraries.
    $element['#attached']['library'][] = 'webspark_webdir/jstree';
    $element['#attached']['library'][] = 'webspark_webdir/add_field';
    // Make a fieldset which is closed by default.
    $element += array(
      '#type' => 'details',
      '#attributes' => array('class' => array('container-inline')),
      '#open' => TRUE,
    );
    return $element;
  }
}
