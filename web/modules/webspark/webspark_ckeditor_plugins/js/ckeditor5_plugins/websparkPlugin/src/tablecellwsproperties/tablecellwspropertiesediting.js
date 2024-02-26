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

  conversion.for("downcast").elementToElement({
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
              contenteditable: "true",
              class: "ck-editor__editable ck-editor__nested-editable",
              role: "textbox",
            },
            []
          );
        case "td":
          return writer.createEditableElement(
            "td",
            {
              contenteditable: "true",
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
              contenteditable: "true",
              class:
                "ck-editor__editable ck-editor__nested-editable " +
                modelElement.getAttribute("cellType"),
              role: "textbox",
            },
            []
          );
      }
    },
    converterPriority: "high",
  });
}
