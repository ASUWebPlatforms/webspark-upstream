/**
 * @file defines InsertWebsparkLeadCommand, which is executed when the websparkLead
 * form is submitted.
 */

import {Command} from "ckeditor5/src/core";

export default class InsertWebsparkLeadCommand extends Command {
  execute({text}) {
    const {model} = this.editor;
    model.change((writer) => {
      const websparkLead = writer.createElement(
        "websparkLead"
      );
      const websparkLeadText = writer.createElement(
        "websparkLeadText",
      );
      const textNode = writer.createText(text);
      writer.append(textNode, websparkLeadText);
      writer.append(websparkLeadText, websparkLead);
      model.insertContent(websparkLead);
    });
  }

  refresh() {
    const {model} = this.editor;
    const {selection} = model.document;

    const allowedIn = model.schema.findAllowedParent(
      selection.getFirstPosition(),
      "websparkLead"
    );

    this.isEnabled = allowedIn !== null;

    const selectedElement = selection.getSelectedElement();
    if (selectedElement?.name === "websparkLead") {
      const span = selectedElement.getChild(0)?.getChild(0);
      if (span) {
        this.value = {
          ...Object.fromEntries(span.getAttributes()),
          text: span._data ?? "",
        };
      }
    } else {
      this.value = null;
    }
  }
}
