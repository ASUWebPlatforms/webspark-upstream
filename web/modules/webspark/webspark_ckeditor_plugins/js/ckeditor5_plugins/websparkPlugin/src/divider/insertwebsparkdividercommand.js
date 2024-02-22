/**
 * @file defines InsertWebsparkDividerCommand, which is executed when the websparkDivider
 * toolbar button is pressed.
 */
// cSpell:ignore websparkdividerediting

import { Command } from "ckeditor5/src/core";

export default class InsertWebsparkDividerCommand extends Command {
  
  execute(option) {
    const { model } = this.editor;

    model.change((writer) => {
      // Insert <websparkDividerArea>*</websparkDividerArea> at the current selection position
      // in a way that will result in creating a valid model structure.
      model.insertContent(createWebsparkDividerArea(writer));
    });
  }

  refresh() {
    const { model } = this.editor;
    const { selection } = model.document;

    // Determine if the cursor (selection) is in a position where adding a
    // websparkDivider is permitted. This is based on the schema of the model(s)
    // currently containing the cursor.
    const allowedIn = model.schema.findAllowedParent(
      selection.getFirstPosition(),
      "$block"
    );

    // If the cursor is not in a location where a websparkDivider can be added, return
    // null so the addition doesn't happen.
    this.isEnabled = allowedIn !== null;
  }
}

function createWebsparkDividerArea(writer) {
  // Create instances of the three elements registered with the editor in
  // websparkdividerediting.js.
  const websparkDivider = writer.createElement("websparkDivider");
  writer.setAttribute('class', 'copy-divider', websparkDivider);
  // Return the element to be added to the editor.
  return websparkDivider;
}
