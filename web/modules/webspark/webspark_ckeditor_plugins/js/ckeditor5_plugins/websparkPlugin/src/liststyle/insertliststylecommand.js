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

      // Iterate over the child nodes of each element below the current node
      // If the child node is the first child, remove the 'htmlSpan' attribute
      // If the child node is a 'softBreak', get the next child node
      // If the next child node exists, add a new 'htmlSpan' attribute to it
      // This ensures that each 'softBreak' node has a corresponding 'htmlSpan' attribute
      const nodes = element._children._nodes;
      nodes.forEach((child, index) => {
        if (index === 0) {
          child._attrs.delete('htmlSpan');
        }
        if (child.name === 'softBreak') {
          const nextChild = nodes[index + 1];
          if (nextChild) { // Check if nextChild exists
            // Ensure _attrs is a Map
            if (!nextChild._attrs) {
              nextChild._attrs = new Map();
            }

            // If _attrs is not a Map, convert it to one (optional depending on context)
            if (!(nextChild._attrs instanceof Map)) {
                nextChild._attrs = new Map(Object.entries(nextChild._attrs));
            }

            // Add the 'htmlSpan' entry with an object as its value
            nextChild._attrs.set('htmlSpan', {});
          }
        }
      })
    });
    // If the current node is the first node, remove the 'htmlSpan' attribute
    try {
      const aux = this.editor.model.document.selection.anchor.index;
      if (aux == 0) {
        this.editor.model.document.selection._selection._attrs.delete('htmlSpan'); 
      }
    } catch (e) {}
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
