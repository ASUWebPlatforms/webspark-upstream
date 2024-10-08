/**
 * @file defines InsertwebsparkBlockquoteAnimatedCommand, which is executed when the websparkBlockquoteAnimated
 * form is submitted.
 */

import { Command } from "ckeditor5/src/core";
export default class InsertwebsparkBlockquoteAnimatedAnimatedCommand extends Command {
  execute({ text, citationName, citationDescription, title }) {
    const { model } = this.editor;
    model.change((writer) => {
      const websparkBlockquoteAnimated = writer.createElement(
        "websparkBlockquoteAnimated"
      );

      const websparkBlockquoteAnimatedContainer = writer.createElement(
        "websparkBlockquoteAnimatedContainer"
      );
      const websparkBlockquoteAnimatedTitle = writer.createElement(
        "websparkBlockquoteAnimatedTitle"
      );
      const websparkBlockquoteAnimatedParagraph = writer.createElement(
        "websparkBlockquoteAnimatedParagraph"
      );
      const websparkBlockquoteAnimatedCitation = writer.createElement(
        "websparkBlockquoteAnimatedCitation"
      );
      const websparkBlockquoteAnimatedCitationName = writer.createElement(
        "websparkBlockquoteAnimatedCitationName"
      );

      const websparkBlockquoteAnimatedCitationDescription =
        writer.createElement("websparkBlockquoteAnimatedCitationDescription");

      const textTitle = writer.createText(title);
      writer.append(textTitle, websparkBlockquoteAnimatedTitle);

      const textNode = writer.createText(text);
      writer.append(textNode, websparkBlockquoteAnimatedParagraph);

      if (citationName.length > 0) {
        const textNodeCitationName = writer.createText(citationName);
        writer.append(
          textNodeCitationName,
          websparkBlockquoteAnimatedCitationName
        );
        writer.append(
          websparkBlockquoteAnimatedCitationName,
          websparkBlockquoteAnimatedCitation
        );
      }
      if (citationDescription.length > 0) {
        const textNodeDescription = writer.createText(citationDescription);
        writer.append(
          textNodeDescription,
          websparkBlockquoteAnimatedCitationDescription
        );
        writer.append(
          websparkBlockquoteAnimatedCitationDescription,
          websparkBlockquoteAnimatedCitation
        );
      }

      if (title.length > 0) {
        writer.append(
          websparkBlockquoteAnimatedTitle,
          websparkBlockquoteAnimatedContainer
        );
      }

      writer.append(
        websparkBlockquoteAnimatedParagraph,
        websparkBlockquoteAnimatedContainer
      );
      writer.append(
        websparkBlockquoteAnimatedCitation,
        websparkBlockquoteAnimatedContainer
      );
      writer.append(
        websparkBlockquoteAnimatedContainer,
        websparkBlockquoteAnimated
      );
      model.insertContent(websparkBlockquoteAnimated);
    });
  }

  refresh() {
    const { model } = this.editor;
    const { selection } = model.document;

    // Determine if the cursor (selection) is in a position where adding a
    // websparkBlockquoteAnimated is permitted. This is based on the schema of the model(s)
    // currently containing the cursor.
    const allowedIn = model.schema.findAllowedParent(
      selection.getFirstPosition(),
      "websparkBlockquoteAnimated"
    );

    // If the cursor is not in a location where a websparkBlockquoteAnimated can be added, return
    // null so the addition doesn't happen.
    this.isEnabled = allowedIn !== null;

    const selectedElement = selection.getSelectedElement();

    if (selectedElement?.name === "websparkBlockquoteAnimated") {
      const text = selectedElement?.getChild(0)?.getChild(0)?._data;

      model.change((writer) => {
        writer.setAttribute("text", text, selectedElement);
      });

      this.value = Object.fromEntries(selectedElement.getAttributes());
    } else {
      this.value = null;
    }
  }
}
