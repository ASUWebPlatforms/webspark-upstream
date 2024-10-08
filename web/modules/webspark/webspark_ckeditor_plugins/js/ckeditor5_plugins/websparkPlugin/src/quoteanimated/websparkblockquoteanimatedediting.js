import { Plugin } from "ckeditor5/src/core";
import { toWidget, toWidgetEditable, Widget } from "ckeditor5/src/widget";
import InsertWebsparkBlockquoteAnimatedCommand from "./insertwebsparkblockquoteanimatedcommand";

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
export default class WebsparkBlockquoteAnimatedEditing extends Plugin {
  static get requires() {
    return [Widget];
  }

  init() {
    this._defineSchema();
    this._defineConverters();
    this.editor.commands.add(
      "insertWebsparkBlockquoteAnimated",
      new InsertWebsparkBlockquoteAnimatedCommand(this.editor)
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

    schema.register("websparkBlockquoteAnimated", {
      isObject: true,
      allowWhere: "$block",
    });

    schema.register("websparkBlockquoteAnimatedSvg", {
      isObject: true,
      allowIn: "websparkBlockquoteAnimated",
      allowContentOf: "$block",
      allowAttributes: ["role", "title", "viewBox", "xmlns"],
    });

    schema.register("websparkBlockquoteAnimatedContainer", {
      isLimit: true,
      allowIn: "websparkBlockquoteAnimated",
      allowContentOf: "$block",
    });

    schema.register("websparkBlockquoteAnimatedTitle", {
      isLimit: true,
      allowIn: "websparkBlockquoteAnimatedContainer",
      allowContentOf: "$block",
    });

    schema.register("websparkBlockquoteAnimatedParagraph", {
      isLimit: true,
      allowIn: "websparkBlockquoteAnimatedContainer",
      allowContentOf: "$block",
    });

    schema.register("websparkBlockquoteAnimatedCitation", {
      isLimit: true,
      allowIn: "websparkBlockquoteAnimatedContainer",
      allowContentOf: "$text",
    });

    schema.register("websparkBlockquoteAnimatedCitationName", {
      isLimit: true,
      allowIn: "websparkBlockquoteAnimatedCitation",
      allowContentOf: "$block",
    });

    schema.register("websparkBlockquoteAnimatedCitationDescription", {
      isLimit: true,
      allowIn: "websparkBlockquoteAnimatedCitation",
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
      model: "websparkBlockquoteAnimatedCitationName",
      view: {
        name: "cite",
        classes: "name",
      },
    });

    conversion.for("dataDowncast").elementToElement({
      model: "websparkBlockquoteAnimatedCitationName",
      view: {
        name: "cite",
        classes: "name",
      },
    });

    conversion.for("editingDowncast").elementToElement({
      model: "websparkBlockquoteAnimatedCitationName",
      view: (_modelElement, { writer }) => {
        const div = writer.createEditableElement("cite", {
          class: "name",
        });

        return toWidgetEditable(div, writer);
      },
    });

    conversion.for("upcast").elementToElement({
      model: "websparkBlockquoteAnimatedCitationDescription",
      view: {
        name: "cite",
        classes: "description",
      },
    });

    conversion.for("dataDowncast").elementToElement({
      model: "websparkBlockquoteAnimatedCitationDescription",
      view: {
        name: "cite",
        classes: "description",
      },
    });

    conversion.for("editingDowncast").elementToElement({
      model: "websparkBlockquoteAnimatedCitationDescription",
      view: (_modelElement, { writer }) => {
        const div = writer.createEditableElement("cite", {
          class: "description",
        });

        return toWidgetEditable(div, writer);
      },
    });

    conversion.for("upcast").elementToElement({
      model: "websparkBlockquoteAnimatedCitation",
      view: {
        name: "div",
        classes: "citation",
      },
    });

    conversion.for("dataDowncast").elementToStructure({
      model: "websparkBlockquoteAnimatedCitation",
      view: (modelElement, conversionApi) => {
        const { writer } = conversionApi;
        const divViewElement = writer.createContainerElement(
          "div",
          { class: "citation-content" },
          [writer.createSlot()]
        );

        return writer.createContainerElement("div", { class: "citation" }, [
          divViewElement,
        ]);
      },
    });

    conversion.for("editingDowncast").elementToStructure({
      model: "websparkBlockquoteAnimatedCitation",
      view: (modelElement, conversionApi) => {
        const { writer } = conversionApi;
        const divViewElement = writer.createContainerElement(
          "div",
          { class: "citation-content" },
          [writer.createSlot()]
        );

        return writer.createContainerElement("div", { class: "citation" }, [
          divViewElement,
        ]);
      },
    });

    conversion.for("upcast").elementToElement({
      model: "websparkBlockquoteAnimatedParagraph",
      view: {
        name: "h2",
      },
    });

    conversion.for("dataDowncast").elementToElement({
      model: "websparkBlockquoteAnimatedParagraph",
      view: {
        name: "h2",
      },
    });

    conversion.for("editingDowncast").elementToElement({
      model: "websparkBlockquoteAnimatedParagraph",
      view: (_modelElement, { writer }) => {
        const paragraphElement = writer.createEditableElement("h2", {});
        return toWidgetEditable(paragraphElement, writer);
      },
    });

    //---------
    conversion.for("upcast").elementToElement({
      model: "websparkBlockquoteAnimatedTitle",
      view: {
        name: "h4",
      },
    });

    conversion.for("dataDowncast").elementToElement({
      model: "websparkBlockquoteAnimatedTitle",
      view: {
        name: "h4",
      },
    });

    conversion.for("editingDowncast").elementToElement({
      model: "websparkBlockquoteAnimatedTitle",
      view: (_modelElement, { writer }) => {
        const paragraphElement = writer.createEditableElement("h4", {});
        return toWidgetEditable(paragraphElement, writer);
      },
    });
    //---------

    conversion.for("upcast").elementToElement({
      model: "websparkBlockquoteAnimatedContainer",
      view: {
        name: "blockquote",
      },
    });

    conversion.for("dataDowncast").elementToElement({
      model: "websparkBlockquoteAnimatedContainer",
      view: {
        name: "blockquote",
      },
    });

    conversion.for("editingDowncast").elementToElement({
      model: "websparkBlockquoteAnimatedContainer",
      view: (_modelElement, { writer }) => {
        const blockquoteAnimated = writer.createEditableElement(
          "blockquote",
          {}
        );

        return toWidgetEditable(blockquoteAnimated, writer);
      },
    });

    conversion.for("upcast").elementToElement({
      view: {
        name: "div",
        classes: ["uds-blockquoteAnimated", "accent-maroon"],
      },
      model: (viewElement, { writer }) => {
        return writer.createElement("websparkBlockquoteAnimated", {});
      },
    });

    conversion.for("dataDowncast").elementToElement({
      model: "websparkBlockquoteAnimated",
      view: (modelElement, { writer }) => {
        return writer.createContainerElement("div", {
          class: `uds-blockquoteAnimated accent-maroon`,
        });
      },
    });

    conversion.for("editingDowncast").elementToElement({
      model: "websparkBlockquoteAnimated",
      view: (modelElement, { writer }) => {
        const divBQ = writer.createContainerElement("div", {
          class: `uds-blockquoteAnimated accent-maroon`,
        });
        return toWidget(divBQ, writer, { label: "BlockQuote Animated" });
      },
    });
  }
}
