/**
 * @file defines InsertWebsparkListStyleCommand.
 */
import { Command } from "ckeditor5/src/core";
import { Collection, first, toMap } from "ckeditor5/src/utils";
import {_formatStyleBulletedClass, _formatStyleNumberedClass, _getSibling} from "./utils";

export default class InsertWebsparkListStyleCommand extends Command {
  /**
   * Executes an action on selected blocks in the editor.
   *
   * @param {Object} options - The options for executing the action.
   * @param {string} options.styleClass - The CSS class to be applied to the selected blocks.
   */
  execute({ styleClass }) {
    const model = this.editor.model;
    const selection = model.document.selection;
    const document = model.document;

    let currentNode = first(
      this.editor.model.document.selection.getSelectedBlocks()
    );
    const elementsBelow = [];
    const listTypeClasses = this.editor.commands.get("bulletedListOld").value
      ? _formatStyleBulletedClass(styleClass)
      : this.editor.commands.get("numberedListOld").value
      ? _formatStyleNumberedClass(styleClass)
      : "";
    model.change((writer) => {
      _getSibling(currentNode, elementsBelow, "backward");
      _getSibling(currentNode, elementsBelow, "forward");
      elementsBelow.forEach((element) => {
        if (element.getAttribute("listIndent") == 0) {
          if (element.getAttribute("listType") === 'bulleted') {
            writer.setAttribute(
              "htmlUlAttributes",
              {classes: listTypeClasses},
              element
            );
          } else if (element.getAttribute("listType") === 'numbered') {
            writer.setAttribute(
              "htmlOlAttributes",
              {classes: listTypeClasses},
              element
            );
          }
        }
      });
    });
  }

  /**
   * Refreshes the state of the action.
   * Updates the isEnabled property and captures attributes from sibling elements.
   */
  refresh() {
    this.isEnabled = this._checkEnabled();
    let currentNode = first(
      this.editor.model.document.selection.getSelectedBlocks()
    );

    const elementsBelow = [];
    _getSibling(currentNode, elementsBelow, "backward");
    _getSibling(currentNode, elementsBelow, "forward");
    elementsBelow.forEach((element) => {
      this.value = Object.fromEntries(element.getAttributes());
    });
  }

  /**
   * Checks whether the command can be enabled in the current context.
   *
   * @returns Whether the command should be enabled.
   */
  _checkEnabled() {
    const editor = this.editor;

    const numberedListOld = editor.commands.get("numberedListOld");
    const bulletedListOld = editor.commands.get("bulletedListOld");

    return numberedListOld.isEnabled || bulletedListOld.isEnabled;
  }

}
