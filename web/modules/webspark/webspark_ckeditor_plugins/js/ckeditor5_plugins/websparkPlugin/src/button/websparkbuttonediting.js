import { Plugin } from "ckeditor5/src/core";
import { Widget, toWidget, toWidgetEditable } from "ckeditor5/src/widget";
import InsertWebsparkButtonCommand from "./insertbuttoncommand";
import {
  extractDataFromClasses
} from "../utils/utils";

/**
 * CKEditor 5 plugins do not work directly with the DOM. They are defined as
 * plugin-specific data models that are then converted to markup that
 * is inserted in the DOM.
 *
 * CKEditor 5 internally interacts with websparkButton as this model:
 * <websparkButton>
 *    <websparkButtonText></websparkButtonText>
 * </websparkButton>
 *
 * Which is converted for the browser/user as this markup
 * <a class="btn">
 *   <span class="text"></span>
 * </a>
 *
 * This file has the logic for defining the websparkButton model, and for how it is
 * converted to standard DOM markup.
 */
export default class WebsparkButtonEditing extends Plugin {
  static get requires() {
    return [Widget];
  }

  init() {
    this._defineSchema();
    this._defineConverters();
    this.editor.commands.add(
      "insertWebsparkButton",
      new InsertWebsparkButtonCommand(this.editor)
    );
  }

  /*
   * This registers the structure that will be seen by CKEditor 5 as
   * <websparkButton>
   *    <websparkButtonText></websparkButtonText>
   * </websparkButton>
   *
   * The logic in _defineConverters() will determine how this is converted to
   * markup.
   */
  _defineSchema() {
    // Schemas are registered via the central `editor` object.
    const schema = this.editor.model.schema;

    schema.register("websparkButton", {
      isObject: true,
      allowWhere: "$block",
      allowAttributes: ["text", "href", "target", "styles", "role", "size"],
    });

    schema.register("websparkButtonText", {
      isLimit: true,
      allowIn: "websparkButton",
      allowContentOf: "$block",
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
        name: "a",
        classes: ["btn", /^btn-(gold|maroon|gray|dark)$/],
        attributes: true,
      },
      model: (viewElement, { writer }) => {
        const classes = viewElement.getAttribute("class");

        return writer.createElement("websparkButton", {
          text: viewElement.getAttribute("text"),
          href: viewElement.getAttribute("href"),
          styles: extractDataFromClasses(classes, {
            "btn-gold": "gold",
            "btn-maroon": "maroon",
            "btn-gray": "gray",
            "btn-dark": "dark",
          }, null),
          size: extractDataFromClasses(classes, {
            "btn-md": "md",
            "btn-sm": "sm"
          }, 'default'),
          role: "button",
          target: viewElement.getAttribute("target") || "unset",
        });
      },
    });

    conversion.for("dataDowncast").elementToElement({
      model: "websparkButton",
      view: (modelElement, { writer }) => {
        const target = modelElement.getAttribute("target");
        let classes = `btn btn-${modelElement.getAttribute("styles")}`;

        const size = modelElement.getAttribute("size");

        if (size !== "default") {
          classes += ` btn-${size}`;
        }

        return writer.createContainerElement("a", {
          class: classes,
          href: modelElement.getAttribute("href"),
          role: "button",
          ...(target !== "unset" && { target }),
        });
      },
    });

    conversion.for("editingDowncast").elementToElement({
      model: "websparkButton",
      view: (modelElement, { writer }) => {
        let classes = `btn btn-${modelElement.getAttribute("styles")}`;

        const size = modelElement.getAttribute("size");

        if (size !== "default") {
          classes += ` btn-${size}`;
        }

        const a = writer.createContainerElement("a", {
          class: classes,
        });

        return toWidget(a, writer, { label: "Webspark button" });
      },
    });

    conversion.for("upcast").elementToElement({
      model: "websparkButtonText",
      view: {
        name: "span",
        classes: "text",
      },
    });

    conversion.for("dataDowncast").elementToElement({
      model: "websparkButtonText",
      view: {
        name: "span",
        classes: "text",
      },
    });

    conversion.for("editingDowncast").elementToElement({
      model: "websparkButtonText",
      view: (_modelElement, { writer }) => {
        const span = writer.createEditableElement("span", {
          class: "text",
        });

        return toWidgetEditable(span, writer);
      },
    });
  }
}
