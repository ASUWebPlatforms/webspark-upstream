/**
 * @file This is what CKEditor refers to as a master (glue) plugin. Its role is
 * just to load the “editing” and “UI” components of this Plugin. Those
 * components could be included in this file, but
 *
 * I.e, this file's purpose is to integrate all the separate parts of the plugin
 * before it's made discoverable via index.js.
 */

import { Command } from "ckeditor5/src/core";
export default class WebsparkMediaAlterCommand extends Command {
  /**
     * The command value: `false` if there is no `alt` attribute, otherwise the value of the `alt` attribute.
     /**
     * @inheritdoc
     */
  refresh() {
    const selection = this.editor.model.document.selection;
    const drupalMediaElement =
      this._getClosestSelectedDrupalMediaElement(selection);

    this.isEnabled =
      !!drupalMediaElement &&
      drupalMediaElement.getAttribute("drupalMediaEntityType") &&
      drupalMediaElement.getAttribute("drupalMediaEntityType") === "media" &&
      drupalMediaElement.getAttribute("drupalMediaEntityType") !==
        "METADATA_ERROR" &&
      drupalMediaElement.getAttribute("drupalMediaType") === "remote_video";
    if (this.isEnabled) {
      this.editor.execute("addInlineStyle", "w100");
    }
  }

  /**
   * Executes the command.
   *
   * @param {Object} options
   *   An options object.
   * @param {String} options The new value of the `dataInlineStyle` attribute to set.
   */
  execute(options) {
    const { model } = this.editor;
    const drupalMediaElement = this._getClosestSelectedDrupalMediaElement(
      model.document.selection
    );
    model.change((writer) => {
      writer.setAttribute("dataInlineStyle", options, drupalMediaElement);
    });
  }

  /**
   * Returns the closest selected Drupal media element.
   *
   * @param {Selection} selection - The selection object.
   * @return {Element} The closest selected Drupal media element.
   */
  _getClosestSelectedDrupalMediaElement(selection) {
    const selectedElement = selection.getSelectedElement();
    return this._isDrupalMedia(selectedElement)
      ? selectedElement
      : selection.getFirstPosition().findAncestor("drupalMedia");
  }

  /**
   * Checks if the given model element is a Drupal media element.
   *
   * @param {type} modelElement - The model element to check.
   * @return {boolean} Returns true if the model element is a Drupal media element, otherwise returns false.
   */
  _isDrupalMedia(modelElement) {
    return !!modelElement && modelElement.is("element", "drupalMedia");
  }
}
