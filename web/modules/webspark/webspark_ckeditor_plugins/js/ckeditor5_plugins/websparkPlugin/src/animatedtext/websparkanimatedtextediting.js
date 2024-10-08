import { Plugin } from "ckeditor5/src/core";
import AnimatedTextCommand from "./animatedtextcommand";

export default class WebsparkAnimatedTextEditing extends Plugin {
  /**
   * @inheritDoc
   */
  static get pluginName() {
    return "WebsparkAnimatedTextEditing";
  }

  /**
   * @inheritDoc
   */
  constructor(editor) {
    super(editor);

    editor.config.define("highlight", {
      options: [
        {
          model: "yellowPen",
          class: "pen-yellow",
          title: "Yellow animated",
          color: "var(--ck-highlight-marker-yellow)",
          type: "pen",
        },
      ],
    });
  }

  /**
   * @inheritDoc
   */
  init() {
    const editor = this.editor;

    // Allow highlight attribute on text nodes.
    editor.model.schema.extend("$text", { allowAttributes: "highlight" });

    editor.model.schema.addAttributeCheck((context, attributeName) => {
      if (attributeName === "highlight") {
        if (context.endsWith("websparkBlockquoteAnimatedParagraph $text")) {
          return true;
        }
        return false;
      }
    });

    const options = editor.config.get("highlight.options");

    // Set-up the two-way conversion.
    editor.conversion.attributeToElement(_buildDefinition(options));

    editor.commands.add("highlight", new AnimatedTextCommand(editor));
  }
}

/**
 * Converts the options array to a converter definition.
 *
 * @param options An array with configured options.
 */
function _buildDefinition(options) {
  const definition = {
    model: {
      key: "highlight",
      values: [],
    },
    view: {},
  };

  for (const option of options) {
    definition.model.values.push(option.model);
    definition.view[option.model] = {
      name: "mark",
      classes: option.class,
    };
  }

  return definition;
}
