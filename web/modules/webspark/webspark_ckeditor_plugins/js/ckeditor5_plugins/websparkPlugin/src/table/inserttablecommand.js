import { Command } from "ckeditor5/src/core";

export default class InsertWebsparkTableCommand extends Command {
  execute({ rows, cols: columns, headers, tabletype, caption }) {
    const { model } = this.editor;
    const tableUtils = this.editor.plugins.get("TableUtils");

    const headingRows = headers === "both" || headers === "row" ? 1 : 0;
    const headingColumns = headers === "both" || headers === "column" ? 1 : 0;

    model.change((writer) => {
      const table = tableUtils.createTable(writer, {
        rows,
        columns,
        headingRows,
        headingColumns,
      });

      model.insertObject(table, null, null, { findOptimalPosition: "auto" });
      // Set the cursor at the beginning of the table
      writer.setSelection(writer.createPositionAt(table.getNodeByPath([0]), 0));

      // Create a range around the table
      const range = writer.createRange(
        writer.createPositionBefore(table),
        writer.createPositionAfter(table)
      );
      // Create a wrapper element for the table
      const wrapper = writer.createElement("websparkTable", {
        type: tabletype,
      });

      // Wrap the range with the wrapper element and append the table
      writer.wrap(range, wrapper);
      writer.append(table, wrapper);
      model.insertContent(wrapper);

      // Check if a caption is provided and insert it if it exists
      if (caption?.length) {
        const newCaptionElement = writer.createElement("caption");
        writer.insertText(caption, newCaptionElement, "end");

        const tableElement = getSelectionAffectedTable(
          model.document.selection
        );
        model.insertContent(newCaptionElement, tableElement, "end");
      }
    });
  }

  refresh() {
    const { model } = this.editor;
    const { selection } = model.document;

    const allowedIn = model.schema.findAllowedParent(
      selection.getFirstPosition(),
      "websparkTable"
    );

    this.isEnabled = allowedIn !== null;
  }
}
function getSelectionAffectedTable(selection) {
  const selectedElement = selection.getSelectedElement();

  // Is the command triggered from the `tableToolbar`?
  if (selectedElement && selectedElement.is("element", "table")) {
    return selectedElement;
  }

  return selection.getFirstPosition().findAncestor("table");
}
