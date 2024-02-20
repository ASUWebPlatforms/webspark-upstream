/**
 * @file defines InsertWebsparkBlockquoteCommand, which is executed when the websparkBlockquote
 * form is submitted.
 */

import { Command } from "ckeditor5/src/core";
export default class InsertWebsparkBlockquoteCommand extends Command {
  execute({ text, citationName, citationDescription }) {
    const { model } = this.editor;
    model.change((writer) => {
      const websparkBlockquote = writer.createElement("websparkBlockquote");
      const websparkBlockQuoteSvg = writer.createElement(
        "websparkBlockQuoteSvg"
      );
      const websparkBlockQuoteContainer = writer.createElement(
        "websparkBlockQuoteContainer"
      );
      const websparkBlockquoteParagraph = writer.createElement(
        "websparkBlockquoteParagraph"
      );
      const websparkBlockquoteCitation = writer.createElement(
        "websparkBlockquoteCitation"
      );
      const websparkBlockquoteCitationName = writer.createElement(
        "websparkBlockquoteCitationName"
      );
      const websparkBlockquoteCitationDescription = writer.createElement(
        "websparkBlockquoteCitationDescription"
      );

      const textNode = writer.createText(text);
      writer.append(textNode, websparkBlockquoteParagraph);

      if (citationName.length > 0) {
        const textNodeCitationName = writer.createText(citationName);
        writer.append(textNodeCitationName, websparkBlockquoteCitationName);
        writer.append(
          websparkBlockquoteCitationName,
          websparkBlockquoteCitation
        );
      }
      if (citationDescription.length > 0) {
        const textNodeDescription = writer.createText(citationDescription);
        writer.append(
          textNodeDescription,
          websparkBlockquoteCitationDescription
        );
        writer.append(
          websparkBlockquoteCitationDescription,
          websparkBlockquoteCitation
        );
      }

      writer.append(websparkBlockQuoteSvg, websparkBlockquote);
      writer.append(websparkBlockquoteParagraph, websparkBlockQuoteContainer);
      writer.append(websparkBlockquoteCitation, websparkBlockQuoteContainer);
      writer.append(websparkBlockQuoteContainer, websparkBlockquote);
      model.insertContent(websparkBlockquote);
    });
  }

  refresh() {
    const { model } = this.editor;
    const { selection } = model.document;

    // Determine if the cursor (selection) is in a position where adding a
    // websparkBlockquote is permitted. This is based on the schema of the model(s)
    // currently containing the cursor.
    const allowedIn = model.schema.findAllowedParent(
      selection.getFirstPosition(),
      "websparkBlockquote"
    );

    // If the cursor is not in a location where a websparkBlockQuote can be added, return
    // null so the addition doesn't happen.
    this.isEnabled = allowedIn !== null;

    const selectedElement = selection.getSelectedElement();

    if (selectedElement?.name === "websparkBlockquote") {
      const text = selectedElement?.getChild(0)?.getChild(0)?._data;

      model.change((writer) => {
        writer.setAttribute("text", text, selectedElement);
      });

      this.value = Object.fromEntries(selectedElement.getAttributes());
    } else {
      this.value = null;
    }
  }
  _defaultSvgPath() {
    return "M113.61,245.82H0V164.56q0-49.34,8.69-77.83T40.84,35.58Q64.29,12.95,100.67,0l22.24,46.9q-34,11.33-48.72,31.54T58.63,132.21h55Zm180,0H180V164.56q0-49.74,8.7-78T221,35.58Q244.65,12.95,280.63,0l22.24,46.9q-34,11.33-48.72,31.54t-15.57,53.77h55Z";
  }
}
