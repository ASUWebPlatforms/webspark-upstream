import { Plugin } from "ckeditor5/src/core";
import { Widget } from "ckeditor5/src/widget";
import InsertWebsparkAdvancedImageCommand from "./insertadvancedimagecommand";

export default class WebsparkAdvancedImageEditing extends Plugin {
  static get requires() {
    return [Widget];
  }

  init() {
    this._defineSchema();
    this._defineConverters();
    this.editor.commands.add(
      "insertWebsparkAdvancedImage",
      new InsertWebsparkAdvancedImageCommand(this.editor)
    );
  }

  _defineSchema() {
    const schema = this.editor.model.schema;

    if (schema.isRegistered("imageInline")) {
      schema.extend("imageInline", {
        allowAttributes: [
          "spacingTop",
          "spacingBottom",
          "spacingLeft",
          "spacingRight",
          "roundedImage",
          "imageFluid",
        ],
      });
    }

    if (schema.isRegistered("imageBlock")) {
      schema.extend("imageBlock", {
        allowAttributes: [
          "spacingTop",
          "spacingBottom",
          "spacingLeft",
          "spacingRight",
          "roundedImage",
          "imageFluid",
        ],
      });
    }
  }

  /**
   * Converters determine how CKEditor 5 models are converted into markup and
   * vice-versa.
   */
  _defineConverters() {
    const { conversion } = this.editor;

    const spaces = [
      {
        htmlName: "spacing-top",
        modelName: "spacingTop",
      },
      {
        htmlName: "spacing-bottom",
        modelName: "spacingBottom",
      },
      {
        htmlName: "spacing-right",
        modelName: "spacingRight",
      },
      {
        htmlName: "spacing-left",
        modelName: "spacingLeft",
      },
      {
        htmlName: "rounded-circle",
        modelName: "roundedImage",
      },
    ];
    
    // Iterates over each space object and defines attribute converters for upcast and downcast.
    spaces.forEach((space) => {
      conversion.for("upcast").attributeToAttribute({
        view: {
          key: "class",
          value: new RegExp(space.htmlName + "+"),
        },
        model: {
          key: space.modelName,
          value: (viewElement) => {
            let classes = Array.from(viewElement._classes);
            let filteredClass = classes.filter((htmlClass) =>
              htmlClass.includes(space.htmlName)
            );
            return filteredClass.length === 0 ? "none" : filteredClass[0];
          },
        },
      });

      conversion.for("downcast").attributeToAttribute({
        model: {
          name: "imageBlock",
          key: space.modelName,
        },
        view: (modelAttributeValue) => {
          if (modelAttributeValue !== "none") {
            return {
              key: "class",
              value: modelAttributeValue,
            };
          }
        },
      });

      conversion.for("downcast").attributeToAttribute({
        model: {
          name: "imageInline",
          key: space.modelName,
        },
        view: (modelAttributeValue) => {
          return {
            key: "class",
            value: modelAttributeValue,
          };
        },
      });
    });

    conversion.for("downcast").attributeToAttribute({
      model: {
        name: "imageBlock",
        key: "imageFluid",
      },
      view: (modelAttributeValue) => {
        return {
          key: "class",
          value: "img-fluid",
        };
      },
    });

    conversion.for("downcast").attributeToAttribute({
      model: {
        name: "imageInline",
        key: "imageFluid",
      },
      view: (modelAttributeValue) => {
        return {
          key: "class",
          value: "img-fluid",
        };
      },
    });

    conversion.for("upcast").attributeToAttribute({
      view: {
        key: "class",
        value: "img-fluid",
      },
      model: {
        key: "imageFluid",
        value: (viewElement) => {
          return true;
        },
      },
    });
  }
}
