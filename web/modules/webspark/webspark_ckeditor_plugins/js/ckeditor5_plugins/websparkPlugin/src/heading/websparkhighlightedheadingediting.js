import { Plugin } from "ckeditor5/src/core";
import { Widget, toWidget, toWidgetEditable } from "ckeditor5/src/widget";
import InsertWebsparkHighlightedHeadingCommand from "./insertwebsparkhighlightedheadingcommand";
import { extractDataFromClasses } from "../utils/utils";

// cSpell:ignore websparkHighlightedHeading insertwebsparkhighlightedheadingcommand

/**
 * CKEditor 5 plugins do not work directly with the DOM. They are defined as
 * plugin-specific data models that are then converted to markup that
 * is inserted in the DOM.
 *
 * CKEditor 5 internally interacts with websparkHighlightedHeading as this model:
 * <websparkHighlightedHeading>
 *    <websparkHighlightedHeadingText></websparkHighlightedHeadingText>
 * </websparkHighlightedHeading>
 *
 * Which is converted for the browser/user as this markup
 * <a class="btn">
 *   <span class="text"></span>
 * </a>
 *
 * This file has the logic for defining the websparkHighlightedHeading model, and for how it is
 * converted to standard DOM markup.
 */
export default class WebsparkHighlightedHeadingEditing extends Plugin {
  static get requires() {
    return [Widget];
  }

  init() {
    this._defineSchema();
    this._defineConverters();
    this.editor.commands.add(
      "insertWebsparkHighlightedHeading",
      new InsertWebsparkHighlightedHeadingCommand(this.editor)
    );
  }

  /*
   * This registers the structure that will be seen by CKEditor 5 as
   * <websparkHighlightedHeading>
   *    <websparkHighlightedHeadingText></websparkHighlightedHeadingText>
   * </websparkHighlightedHeading>
   *
   * The logic in _defineConverters() will determine how this is converted to
   * markup.
   */
  _defineSchema() {
    // Schemas are registered via the central `editor` object.
    const schema = this.editor.model.schema;

    schema.register("websparkHighlightedHeading", {
      isObject: true,
      allowWhere: "$block",
    });

    schema.register("websparkHighlightedHeadingHelement", {
      allowIn: "websparkHighlightedHeading",
      allowAttributes: ["level"],
    });

    schema.register("websparkHighlightedHeadingText", {
      allowIn: "websparkHighlightedHeadingHelement",
      allowAttributes: ["styles"],
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
        name: /^(h1|h2|h3|h4)$/,
      },
      model: (viewElement, { writer }) => {
        return writer.createElement("websparkHighlightedHeadingHelement", {
          level: viewElement.name,
        });
      },
    });

    conversion.for("downcast").elementToElement({
      model: {
        name: "websparkHighlightedHeadingHelement",
        attributes: ["level"],
      },
      view: (modelElement, { writer }) => {
        return writer.createContainerElement(
          modelElement.getAttribute("level")
        );
      },
    });

    conversion.for("upcast").elementToElement({
      view: {
        name: "span",
        classes: [/^highlight-(gold|black|white)$/],
      },
      model: (viewElement, { writer }) => {
        const classes = viewElement.getAttribute("class");

        return writer.createElement("websparkHighlightedHeadingText", {
          styles: extractDataFromClasses(
            classes,
            {
              "highlight-gold": "gold",
              "highlight-black": "black",
              "highlight-white": "white",
            },
            null
          ),
        });
      },
    });

    conversion.for("dataDowncast").elementToElement({
      model: "websparkHighlightedHeadingText",
      view: (modelElement, { writer }) => {
        const classes = `highlight-${modelElement.getAttribute("styles")}`;

        return writer.createContainerElement("span", {
          class: classes,
        });
      },
    });

    conversion.for("editingDowncast").elementToElement({
      model: "websparkHighlightedHeadingText",
      view: (modelElement, { writer }) => {
        const classes = `highlight-${modelElement.getAttribute("styles")}`;
        const span = writer.createEditableElement("span", {
          class: classes,
        });

        return toWidgetEditable(span, writer, { label: "Highlighted Text" });
      },
    });

    conversion.for("upcast").elementToElement({
      view: {
        name: "div",
        classes: ["uds-highlighted-heading"],
      },
      model: (viewElement, { writer }) => {
        return writer.createElement("websparkHighlightedHeading");
      },
    });

    conversion.for("dataDowncast").elementToElement({
      model: "websparkHighlightedHeading",
      view: (modelElement, { writer }) => {
        return writer.createContainerElement("div", {
          class: "uds-highlighted-heading",
        });
      },
    });

    conversion.for("editingDowncast").elementToElement({
      model: "websparkHighlightedHeading",
      view: (modelElement, { writer }) => {
        const divHH = writer.createContainerElement("div", {
          class: "uds-highlighted-heading",
        });

        return toWidget(divHH, writer, { label: "Highlighted Heading" });
      },
    });
  }
}
