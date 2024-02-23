/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
import TableCellPropertyCommand from "@ckeditor/ckeditor5-table/src/tablecellproperties/commands/tablecellpropertycommand";
import { first } from "ckeditor5/src/utils";

/**
 * The table cell border style command.
 *
 * The command is registered by the {@link module:table/tablecellproperties/tablecellpropertiesediting~TableCellPropertiesEditing} as
 * the `'tableCellWsClass'` editor command.
 *
 * To change the border style of selected cells, execute the command:
 *
 * ```ts
 * editor.execute( 'tableCellWsClass', {
 *   value: 'dashed'
 * } );
 * ```
 */
export default class TableCellWsClassCommand extends TableCellPropertyCommand {
  /**
   * Creates a new `TableCellWsClassCommand` instance.
   *
   * @param editor An editor in which this command will be used.
   * @param defaultValue The default value of the attribute.
   */
  constructor(editor) {
    super(editor);
  }

  /**
   * Refreshes the editor.
   *
   * @param {type} None - This function does not accept any parameters.
   * @return {type} None - This function does not return any value.
   */
  refresh() {
    let cell = first(this.editor.model.document.selection.getSelectedBlocks());
    this.isEnabled = cell;
    if (cell && cell.parent) {
      cell = cell.parent;
      this.value = Object.fromEntries(cell.getAttributes());
    }
  }

  /**
   * Executes the function.
   *
   * @param {Object} value - The value used for execution.
   */
  execute({ value }) {
    const { model } = this.editor;
    model.change((writer) => {
      let cell = first(
        this.editor.model.document.selection.getSelectedBlocks()
      );
      if (cell && cell.parent) {
        cell = cell.parent;
        writer.setAttribute("cellType", value, cell);
      }
    });
  }
}
