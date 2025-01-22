/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module table/tablecellwsproperties/tablecellwspropertiesediting
 */
import { Plugin } from "ckeditor5/src/core";
import TableEditing from "@ckeditor/ckeditor5-table/src/tableediting";
import TableCellWsClassCommand from "./tablecellwsclasscommand";

export default class TableCellWsPropertiesEditing extends Plugin {
  /**
   * @inheritDoc
   */
  static get pluginName() {
    return "TableCellWsPropertiesEditing";
  }

  /**
   * @inheritDoc
   */
  static get requires() {
    return [TableEditing];
  }

  /**
   * @inheritDoc
   */
  init() {
    const editor = this.editor;
    const conversion = editor.conversion;
    editor.commands.add(
      "tableCellWsClass",
      new TableCellWsClassCommand(editor)
    );
    markerConversion(conversion);
  }
}

function markerConversion(conversion) {
  conversion.for("upcast").elementToElement({
    view: {
      name: /^(td|th)$/,
    },
    model: (viewElement, { writer }) => {
      const classes = Array.from(viewElement._classes);
      if (classes.includes("normal")) {
        return writer.createElement("tableCell", {
          cellType: "normal",
        });
      }
      if (classes.includes("indent")) {
        return writer.createElement("tableCell", {
          cellType: "indent",
        });
      }
      return writer.createElement("tableCell", {
        cellType: viewElement.name,
      });
    },
    converterPriority: "high",
  });

  // For the editing view (with contenteditable)
  conversion.for("editingDowncast").elementToElement({
    model: {
      name: "tableCell",
      attributes: ["cellType"],
    },
    view: (modelElement, { writer }) => {
      switch (modelElement.getAttribute("cellType")) {
        case "th":
          return writer.createEditableElement(
            "th",
            {
              contenteditable: "true",  // Allow editing in the editor
              class: "ck-editor__editable ck-editor__nested-editable",
              role: "textbox",
            },
            []
          );
        case "td":
          return writer.createEditableElement(
            "td",
            {
              contenteditable: "true",  // Allow editing in the editor
              class: "ck-editor__editable ck-editor__nested-editable",
              role: "textbox",
            },
            []
          );
        case "indent":
        case "normal":
          return writer.createEditableElement(
            "th",
            {
              contenteditable: "true",  // Allow editing in the editor
              class:
                "ck-editor__editable ck-editor__nested-editable " +
                modelElement.getAttribute("cellType"),
              role: "textbox",
            },
            []
          );
      }
    },
    converterPriority: "high", // Ensure this converter has a high priority
  });

  // For the data view (without contenteditable)
  conversion.for("dataDowncast").elementToElement({
    model: {
      name: "tableCell",
      attributes: ["cellType"],
    },
    view: (modelElement, { writer }) => {
      switch (modelElement.getAttribute("cellType")) {
        case "th":
          return writer.createContainerElement("th", {});  // No contenteditable attribute, just a basic table header element
        case "td":
          return writer.createContainerElement("td", {});  // No contenteditable attribute, just a basic table data element
        case "indent":
        case "normal":
          return writer.createContainerElement("th", {
            class: modelElement.getAttribute("cellType"),
          });  // Apply the custom class, but no contenteditable attribute
      }
    },
    converterPriority: "high", // Ensure this converter has a high priority
  });

}
