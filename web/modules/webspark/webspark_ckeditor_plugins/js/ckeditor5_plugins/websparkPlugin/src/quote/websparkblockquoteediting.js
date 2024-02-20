import {Plugin} from "ckeditor5/src/core";
import {toWidget, toWidgetEditable, Widget} from "ckeditor5/src/widget";
import InsertWebsparkBlockquoteCommand from "./insertwebsparkblockquotecommand";

/**
 * CKEditor 5 plugins do not work directly with the DOM. They are defined as
 * plugin-specific data models that are then converted to markup that
 * is inserted in the DOM.
 *
 * CKEditor 5 internally interacts with websparkBlockquote as this model:
 * <websparkBlockquote>
 *    <websparkBlockquoteText></websparkBlockquoteText>
 * </websparkBlockquote>
 *
 * Which is converted for the browser/user as this markup
 * <a class="btn">
 *   <path class="text"></path>
 * </a>
 *
 * This file has the logic for defining the websparkBlockquote model, and for how it is
 * converted to standard DOM markup.
 */
export default class WebsparkBlockquoteEditing extends Plugin {
  static get requires() {
    return [Widget];
  }

  init() {
    this._defineSchema();
    this._defineConverters();
    this.editor.commands.add(
      "insertWebsparkBlockquote",
      new InsertWebsparkBlockquoteCommand(this.editor)
    );
  }

  /*
   * This registers the structure that will be seen by CKEditor 5 as
   * <websparkBlockquote>
   *    <websparkBlockquoteText></websparkBlockquoteText>
   * </websparkBlockquote>
   *
   * The logic in _defineConverters() will determine how this is converted to
   * markup.
   */
  _defineSchema() {
    // Schemas are registered via the central `editor` object.
    const schema = this.editor.model.schema;

    schema.register("websparkBlockquote", {
      isObject: true,
      allowWhere: "$block",
    });

    schema.register("websparkBlockQuoteSvg", {
      isObject: true,
      allowIn: "websparkBlockquote",
      allowContentOf: "$block",
      allowAttributes: ["role", "title", "viewbox"],
    });

    schema.register("websparkBlockQuoteContainer", {
      isLimit: true,
      allowIn: "websparkBlockquote",
      allowContentOf: "$block",
    });

    schema.register("websparkBlockquoteParagraph", {
      isLimit: true,
      allowIn: "websparkBlockQuoteContainer",
      allowContentOf: "$block",
    });

    schema.register("websparkBlockquoteCitation", {
      isLimit: true,
      allowIn: "websparkBlockQuoteContainer",
      allowContentOf: "$block",
    });

    schema.register("websparkBlockquoteCitationName", {
      isLimit: true,
      allowIn: "websparkBlockquoteCitation",
      allowContentOf: "$block",
    });

    schema.register("websparkBlockquoteCitationDescription", {
      isLimit: true,
      allowIn: "websparkBlockquoteCitation",
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
      model: "websparkBlockquoteCitationName",
      view: {
        name: "cite",
        classes: "name",
      },
    });

    conversion.for("dataDowncast").elementToElement({
      model: "websparkBlockquoteCitationName",
      view: {
        name: "cite",
        classes: "name",
      },
    });

    conversion.for("editingDowncast").elementToElement({
      model: "websparkBlockquoteCitationName",
      view: (_modelElement, { writer }) => {
        const div = writer.createEditableElement("cite", {
          class: "name",
        });

        return toWidgetEditable(div, writer);
      },
    });

    conversion.for("upcast").elementToElement({
      model: "websparkBlockquoteCitationDescription",
      view: {
        name: "cite",
        classes: "description",
      },
    });

    conversion.for("dataDowncast").elementToElement({
      model: "websparkBlockquoteCitationDescription",
      view: {
        name: "cite",
        classes: "description",
      },
    });

    conversion.for("editingDowncast").elementToElement({
      model: "websparkBlockquoteCitationDescription",
      view: (_modelElement, { writer }) => {
        const div = writer.createEditableElement("cite", {
          class: "description",
        });

        return toWidgetEditable(div, writer);
      },
    });

    conversion.for("upcast").elementToElement({
      model: "websparkBlockquoteCitation",
      view: {
        name: "div",
        classes: "citation",
      },
    });

    conversion.for("dataDowncast").elementToElement({
      model: "websparkBlockquoteCitation",
      view: {
        name: "div",
        classes: "citation",
      },
    });

    conversion.for("editingDowncast").elementToElement({
      model: "websparkBlockquoteCitation",
      view: (_modelElement, { writer }) => {
        const div = writer.createEditableElement("div", {
          class: "citation",
        });

        return toWidgetEditable(div, writer);
      },
    });

    conversion.for("upcast").elementToElement({
      model: "websparkBlockquoteParagraph",
      view: {
        name: "p",
      },
    });

    conversion.for("dataDowncast").elementToElement({
      model: "websparkBlockquoteParagraph",
      view: {
        name: "p",
      },
    });

    conversion.for("editingDowncast").elementToElement({
      model: "websparkBlockquoteParagraph",
      view: (_modelElement, { writer }) => {
        const paragraphElement = writer.createEditableElement("p", {});

        return toWidgetEditable(paragraphElement, writer);
      },
    });

    conversion.for("upcast").elementToElement({
      model: "websparkBlockQuoteContainer",
      view: {
        name: "blockquote",
      },
    });

    conversion.for("dataDowncast").elementToElement({
      model: "websparkBlockQuoteContainer",
      view: {
        name: "blockquote",
      },
    });

    conversion.for("editingDowncast").elementToElement({
      model: "websparkBlockQuoteContainer",
      view: (_modelElement, { writer }) => {
        const blockquote = writer.createEditableElement("blockquote", {});

        return toWidgetEditable(blockquote, writer);
      },
    });

    conversion.for("upcast").elementToElement({
      view: {
        name: "svg",
        attributes: {
          role: "presentation",
          title: "Open quote",
        },
      },
      model: (viewElement, { writer }) => {
        return writer.createElement("websparkBlockQuoteSvg", {
          role: "presentation",
          title: "Open quote",
          viewbox: "0 0 302.87 245.82",
        });
      },
      converterPriority: "high",
    });

    conversion.for("downcast").elementToElement({
      model: "websparkBlockQuoteSvg",
      view: (modelElement, { writer: viewWriter }) => {
        return viewWriter.createRawElement(
          "svg",
          {
            role: "presentation",
            title: "Open quote",
            viewBox: "0 0 302.87 245.82",
            xmlns: "http://www.w3.org/2000/svg",
          },
          function (domElement) {
            domElement.innerHTML = `<path d="M113.61,245.82H0V164.56q0-49.34,8.69-77.83T40.84,35.58Q64.29,12.95,100.67,0l22.24,46.9q-34,11.33-48.72,31.54T58.63,132.21h55Zm180,0H180V164.56q0-49.74,8.7-78T221,35.58Q244.65,12.95,280.63,0l22.24,46.9q-34,11.33-48.72,31.54t-15.57,53.77h55Z"/>`;
          }
        );
      },
    });

    conversion.for("upcast").elementToElement({
      view: {
        name: "div",
        classes: ["uds-blockquote", "accent-maroon"],
      },
      model: (viewElement, { writer }) => {
        return writer.createElement("websparkBlockquote", {});
      },
    });

    conversion.for("dataDowncast").elementToElement({
      model: "websparkBlockquote",
      view: (modelElement, { writer }) => {
        return writer.createContainerElement("div", {
          class: `uds-blockquote accent-maroon`,
        });
      },
    });

    conversion.for("editingDowncast").elementToElement({
      model: "websparkBlockquote",
      view: (modelElement, { writer }) => {
        const divBQ = writer.createContainerElement("div", {
          class: `uds-blockquote accent-maroon`,
        });
        return toWidget(divBQ, writer, { label: "BlockQuote" });
      },
    });
  }
}