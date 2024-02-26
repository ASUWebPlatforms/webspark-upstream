import { Plugin } from "ckeditor5/src/core";
import { Widget, toWidget, toWidgetEditable } from "ckeditor5/src/widget";
import InsertWebsparkLeadCommand from "./insertwebsparkleadcommand";

// cSpell:ignore websparkLead insertwebsparkleadcommand

/**
 * CKEditor 5 plugins do not work directly with the DOM. They are defined as
 * plugin-specific data models that are then converted to markup that
 * is inserted in the DOM.
 *
 * CKEditor 5 internally interacts with websparkLead as this model:
 * <websparkLead>
 *    <websparkLeadText></websparkLeadText>
 * </websparkLead>
 *
 * Which is converted for the browser/user as this markup
 * <a class="btn">
 *   <span class="text"></span>
 * </a>
 *
 * This file has the logic for defining the websparkLead model, and for how it is
 * converted to standard DOM markup.
 */
export default class WebsparkLeadEditing extends Plugin {
  static get requires() {
    return [Widget];
  }

  init() {
    this._defineSchema();
    this._defineConverters();
    this.editor.commands.add(
      "insertWebsparkLead",
      new InsertWebsparkLeadCommand(this.editor)
    );
  }

  _defineSchema() {
    // Schemas are registered via the central `editor` object.
    const schema = this.editor.model.schema;

    schema.register("websparkLead", {
      isObject: true,
      allowWhere: "$block",
    });

    schema.register("websparkLeadText", {
      allowIn: "websparkLead",
      allowAttributes: ["classes"],
      allowChildren: "$text",
    });
  }

  /**
   * Converters determine how CKEditor 5 models are converted into markup and
   * vice-versa.
   */
  _defineConverters() {
    // Converters are registered via the central editor object.
    const { conversion } = this.editor;

    conversion.for("upcast").elementToElement({
      view: {
        name: "p",
        class: "lead",
      },
      model: (viewElement, { writer }) => {
        const classes = viewElement.getAttribute("class");

        return writer.createElement("websparkLeadText", { classes: classes });
      },
    });

    conversion.for("dataDowncast").elementToElement({
      model: "websparkLeadText",
      view: (modelElement, { writer }) => {
        return writer.createContainerElement("p", {
          class: "lead",
        });
      },
    });

    conversion.for("editingDowncast").elementToElement({
      model: "websparkLeadText",
      view: (modelElement, { writer }) => {
        const span = writer.createEditableElement("p", {
          class: "lead",
        });

        return toWidgetEditable(span, writer, { label: "Lead Text" });
      },
    });

    conversion.for("upcast").elementToElement({
      view: {
        name: "div",
        classes: ["uds-lead"],
      },
      model: (viewElement, { writer }) => {
        return writer.createElement("websparkLead");
      },
    });

    conversion.for("dataDowncast").elementToElement({
      model: "websparkLead",
      view: (modelElement, { writer }) => {
        return writer.createContainerElement("div", {
          class: "uds-lead",
        });
      },
    });

    conversion.for("editingDowncast").elementToElement({
      model: "websparkLead",
      view: (modelElement, { writer }) => {
        const divHH = writer.createContainerElement("div", {
          class: "uds-lead",
        });

        return toWidget(divHH, writer, { label: "Lead" });
      },
    });
  }
}
