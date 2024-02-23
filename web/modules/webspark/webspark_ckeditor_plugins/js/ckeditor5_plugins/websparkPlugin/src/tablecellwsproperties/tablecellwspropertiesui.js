/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module table/tablecellwsproperties/tablecellwspropertiesui
 */
import { Plugin } from "ckeditor5/src/core";
import {
  ButtonView,
  clickOutsideHandler,
  ContextualBalloon,
} from "ckeditor5/src/ui";
import TableCellWsPropertiesView from "./ui/tablecellwspropertiesview";
import { defaultColors } from "@ckeditor/ckeditor5-table/src/utils/ui/table-properties";
import { getTableWidgetAncestor } from "@ckeditor/ckeditor5-table/src/utils/ui/widget";
import {
  getBalloonCellPositionData,
  repositionContextualBalloon,
} from "@ckeditor/ckeditor5-table/src/utils/ui/contextualballoon";
import tableCellWsProperties from "./icons/table-cell-properties.svg";
import { first } from "ckeditor5/src/utils";

const propertyToCommandMap = {
  tableCellWsClass: "tableCellWsClass",
};

/**
 * The table cell properties UI plugin. It introduces the `'tableCellWsProperties'` button
 * that opens a form allowing to specify the visual styling of a table cell.
 *
 * It uses the {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon plugin}.
 */
export default class TableCellWsPropertiesUI extends Plugin {
  /**
   * @inheritDoc
   */
  static get requires() {
    return [ContextualBalloon];
  }
  /**
   * @inheritDoc
   */
  static get pluginName() {
    return "TableCellWsPropertiesUI";
  }
  /**
   * @inheritDoc
   */
  constructor(editor) {
    super(editor);
    editor.config.define("table.tableCellWsProperties", {
      borderColors: defaultColors,
      backgroundColors: defaultColors,
    });
  }
  /**
   * @inheritDoc
   */
  init() {
    const editor = this.editor;
    const t = editor.t;
    this._balloon = editor.plugins.get(ContextualBalloon);
    this.view = null;
    this._isReady = false;
    editor.ui.componentFactory.add("tableCellWsProperties", (locale) => {
      const view = new ButtonView(locale);
      view.set({
        label: t("Cell Ws properties"),
        icon: tableCellWsProperties,
        tooltip: true,
      });
      this.listenTo(view, "execute", () => this._showView());

      const commands = Object.values(propertyToCommandMap).map((commandName) =>
        editor.commands.get(commandName)
      );

      view
        .bind("isEnabled")
        .toMany(commands, "isEnabled", (...areEnabled) =>
          areEnabled.some((isCommandEnabled) => isCommandEnabled)
        );

      return view;
    });
  }

  /**
   * Creates the {@link module:table/tablecellwsproperties/ui/tablecellwspropertiesview~TableCellWsPropertiesView} instance.
   *
   * @returns TableCellWsPropertiesView cell properties form view instance.
   */
  _createPropertiesView() {
    const editor = this.editor;
    const config = editor.config.get("table.tableCellWsProperties");
    const view = new TableCellWsPropertiesView(editor.locale, {});
    const t = editor.t;
    // Render the view so its #element is available for the clickOutsideHandler.
    //view.render();
    this.listenTo(view, "submit", () => {
      this.editor.execute("tableCellWsClass", {
        value: view.classselect,
        //batch: this._undoStepBatch
      });
      this._hideView();
    });
    this.listenTo(view, "cancel", () => {
      if (this._undoStepBatch.operations.length) {
        editor.execute("undo", this._undoStepBatch);
      }
      this._hideView();
    });
    // Close the balloon on Esc key press.
    view.keystrokes.set("Esc", (data, cancel) => {
      this._hideView();
      cancel();
    });
    // Close on click outside of balloon panel element.
    clickOutsideHandler({
      emitter: view,
      activator: () => this._isViewInBalloon,
      contextElements: [this._balloon.view.element],
      callback: () => this._hideView(),
    });
    return view;
  }

  /**
   * Shows the {@link #view} in the {@link #_balloon}.
   *
   * **Note**: Each time a view is shown, a new {@link #_undoStepBatch} is created. It contains
   * all changes made to the document when the view is visible, allowing a single undo step
   * for all of them.
   */
  _showView() {
    const editor = this.editor;
    if (!this.view) {
      this.view = this._createPropertiesView();
    }
    this.listenTo(editor.ui, "update", () => {
      this._updateView();
    });
    let cell = first(this.editor.model.document.selection.getSelectedBlocks());
    if (cell && cell.parent) {
      cell = cell.parent;
      this.view.classselect = cell.getAttribute("cellType");
    }

    this._balloon.add({
      view: this.view,
      position: getBalloonCellPositionData(editor),
    });
    // Create a new batch. Clicking "Cancel" will undo this batch.
    this._undoStepBatch = editor.model.createBatch();
    // Basic a11y.
    this.view.focus();
  }
  /**
   * Removes the {@link #view} from the {@link #_balloon}.
   */
  _hideView() {
    const editor = this.editor;
    this.stopListening(editor.ui, "update");
    this._isReady = false;
    // Blur any input element before removing it from DOM to prevent issues in some browsers.
    // See https://github.com/ckeditor/ckeditor5/issues/1501.
    this.view.saveButtonView.focus();
    this._balloon.remove(this.view);
    // Make sure the focus is not lost in the process by putting it directly
    // into the editing view.
    this.editor.editing.view.focus();
  }
  /**
   * Repositions the {@link #_balloon} or hides the {@link #view} if a table cell is no longer selected.
   */
  _updateView() {
    const editor = this.editor;
    const viewDocument = editor.editing.view.document;
    if (!getTableWidgetAncestor(viewDocument.selection)) {
      this._hideView();
    } else if (this._isViewVisible) {
      repositionContextualBalloon(editor, "cell");
    }
  }
  /**
   * Returns `true` when the {@link #view} is visible in the {@link #_balloon}.
   */
  get _isViewVisible() {
    return !!this.view && this._balloon.visibleView === this.view;
  }
  /**
   * Returns `true` when the {@link #view} is in the {@link #_balloon}.
   */
  get _isViewInBalloon() {
    return !!this.view && this._balloon.hasView(this.view);
  }
}
