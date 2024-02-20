import { Plugin } from "ckeditor5/src/core";
import { toWidget } from "ckeditor5/src/widget";
import { Widget } from "ckeditor5/src/widget";
import InsertWebsparkDividerCommand from "./insertwebsparkdividercommand";

// cSpell:ignore responsivearea insertresponsiveareacommand
export default class WebsparkDividerEditing extends Plugin {
  static get requires() {
    return [Widget];
  }

  init() {
    this._defineSchema();
    this._defineConverters();
    this.editor.commands.add(
      "insertWebsparkDivider",
      new InsertWebsparkDividerCommand(this.editor)
    );
  }

  /*
   * This registers the structure that will be seen by CKEditor 5 as
   * <websparkDivider>
   * </websparkDivider>
   *
   * The logic in _defineConverters() will determine how this is converted to
   * markup.
   */
  _defineSchema() {
    // Schemas are registered via the central `editor` object.
    const schema = this.editor.model.schema;

    schema.register("websparkDivider", {
      isObject: true,
      allowWhere: "$block",
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
        name: "hr",
        classes: "copy-divider",
      },
      model: (viewElement, { writer }) => {
        return writer.createElement("websparkDivider");
      },
      converterPriority: "high",
    });

    conversion.for("dataDowncast").elementToElement({
      model: "websparkDivider",
      view: (modelElement, { writer }) => {
        return writer.createEmptyElement("hr", {
          class: "copy-divider",
        });
      },
    });

    conversion.for("editingDowncast").elementToElement({
      model: "websparkDivider",
      view: (modelElement, { writer }) => {
        const wrapper = writer.createContainerElement(
          "div",
          null,
          writer.createEmptyElement("hr", { class: "copy-divider" })
        );

        writer.addClass("copy-divider", wrapper);
        writer.setCustomProperty("hr", true, wrapper);

        return toWidget(wrapper, writer, { label: "Webspark divider" });
      },
    });
  }
}
