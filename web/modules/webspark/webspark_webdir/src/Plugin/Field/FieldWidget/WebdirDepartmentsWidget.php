<?php
namespace Drupal\webspark_webdir\Plugin\Field\FieldWidget;

use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\WidgetBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Plugin implementation of the 'directory' widget.
 *
 * @FieldWidget(
 *   id = "field_webdir_departments_widget",
 *   module = "webspark_webdir",
 *   label = @Translation("Webdir Departments tree"),
 *   field_types = {
 *     "string_long"
 *   }
 * )
 */
class WebdirDepartmentsWidget extends WidgetBase {

  /**
   * {@inheritdoc}
   */
  public function formElement(FieldItemListInterface $items, $delta, array $element, array &$form, FormStateInterface $form_state) {
    $value = isset($items[$delta]->value) ? $items[$delta]->value : '';
    // Hidden field that will gather all the data from the jstree.
    $element['value'] = [
      '#type' => 'hidden',
      '#default_value' => $value,
      '#attributes' => array('class' => array('directory-tree')),
      '#prefix' => '<div id="directory-tree-options" style="width: 100%"></div>',
    ];

    // Add the required libraries.
    $element['#attached']['library'][] = 'webspark_webdir/jstree';
    $element['#attached']['library'][] = 'webspark_webdir/departments_field';
    // Make a fieldset which is closed by default.
    $element += array(
      '#type' => 'details',
      '#attributes' => array('class' => array('container-inline')),
      '#open' => TRUE,
    );
    return $element;
  }
}
