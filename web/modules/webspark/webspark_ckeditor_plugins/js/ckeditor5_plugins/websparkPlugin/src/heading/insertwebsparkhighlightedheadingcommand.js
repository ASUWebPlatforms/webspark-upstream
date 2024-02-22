/**
 * @file defines InsertWebsparkHighlightedHeadingCommand, which is executed when the websparkHighlightedHeading
 * form is submitted.
 */

import { Command } from "ckeditor5/src/core";
export default class InsertWebsparkHighlightedHeadingCommand extends Command {
  execute({ text, styles, heading }) {
    const { model } = this.editor;
    model.change((writer) => {
      const websparkHighlightedHeading = writer.createElement(
        "websparkHighlightedHeading"
      );
      const websparkHighlightedHeadingHelement = writer.createElement(
        "websparkHighlightedHeadingHelement",
        { level: heading }
      );
      const websparkHighlightedHeadingText = writer.createElement(
        "websparkHighlightedHeadingText",
        { styles }
      );
      const textNode = writer.createText(text);

      writer.append(textNode, websparkHighlightedHeadingText);
      writer.append(
        websparkHighlightedHeadingText,
        websparkHighlightedHeadingHelement
      );
      writer.append(websparkHighlightedHeadingHelement, websparkHighlightedHeading);

      model.insertContent(websparkHighlightedHeading);
    });
  }

  refresh() {
    const { model } = this.editor;
    const { selection } = model.document;

    // Determine if the cursor (selection) is in a position where adding a
    // websparkHighlightedHeading is permitted. This is based on the schema of the model(s)
    // currently containing the cursor.
    const allowedIn = model.schema.findAllowedParent(
      selection.getFirstPosition(),
      "websparkHighlightedHeading"
    );

    // If the cursor is not in a location where a websparkHighlightedHeading can be added, return
    // null so the addition doesn't happen.
    this.isEnabled = allowedIn !== null;

    // Checks if the selected element is a "websparkHighlightedHeading".
    // If it is, retrieves the attributes, text, and heading level from the first child span element.
    // Sets the value object with the retrieved data.
    // If the selected element is not a "websparkHighlightedHeading", sets the value object to null.
    const selectedElement = selection.getSelectedElement();
    if (selectedElement?.name === "websparkHighlightedHeading") {
      const span = selectedElement.getChild(0)?.getChild(0);
      if (span) {
        this.value = {
          ...Object.fromEntries(span.getAttributes()),
          text: span.getChild(0)?._data ?? "",
          heading: span.parent.getAttribute("level"),
        };
      }
    } else {
      this.value = null;
    }
  }
}
