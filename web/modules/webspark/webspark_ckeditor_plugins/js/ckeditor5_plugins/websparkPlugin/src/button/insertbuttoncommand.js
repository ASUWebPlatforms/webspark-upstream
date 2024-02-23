/**
 * @file defines InsertWebsparkButtonCommand, which is executed when the websparkButton
 * form is submitted.
 */

import { Command } from "ckeditor5/src/core";

export default class InsertWebsparkButtonCommand extends Command {
  execute({ href, text, styles, target, size }) {
    const { model } = this.editor;

    model.change((writer) => {
      const websparkButton = writer.createElement("websparkButton", {
        text,
        href,
        target,
        styles,
        size,
      });
      const websparkButtonText = writer.createElement("websparkButtonText");
      const textNode = writer.createText(text);

      writer.append(textNode, websparkButtonText);
      writer.append(websparkButtonText, websparkButton);

      model.insertContent(websparkButton);
    });
  }

  refresh() {
    const { model } = this.editor;
    const { selection } = model.document;

    // Determine if the cursor (selection) is in a position where adding a
    // websparkButton is permitted. This is based on the schema of the model(s)
    // currently containing the cursor.
    const allowedIn = model.schema.findAllowedParent(
      selection.getFirstPosition(),
      "websparkButton"
    );

    // If the cursor is not in a location where a simpleBox can be added, return
    // null so the addition doesn't happen.
    this.isEnabled = allowedIn !== null;

    const selectedElement = selection.getSelectedElement();

    if (selectedElement?.name === "websparkButton") {
      const text = selectedElement?.getChild(0)?.getChild(0)?._data;

      this.value = {
        ...Object.fromEntries(selectedElement.getAttributes()),
        text,
      };
    } else {
      this.value = null;
    }

    // In the layout view, when the editor inserts a webspark button in the editor,then
    // undesired styles are added. So, a timeout and some javascript code is applied to remove them.
    // TO DO: A better solution should be sought.
    setTimeout(function () {
      let offCanvasCssStyle = document.getElementById("ckeditor5-off-canvas-reset");
      if (offCanvasCssStyle) {
        document.body.removeChild(offCanvasCssStyle);
        offCanvasCssStyle.textContent = offCanvasCssStyle.textContent.replace(
          "#drupal-off-canvas-wrapper [data-drupal-ck-style-fence] .ck.ck-content * {display:revert;background:revert;color:initial;padding:revert;}",
          ""
        );
        document.body.appendChild(offCanvasCssStyle);
      }
    }, 500);
  }
}
