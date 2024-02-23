/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module table/tablecellwsproperties/ui/tablecellwspropertiesview
 */
import {
  FocusCycler,
  submitHandler,
  View,
  ViewCollection,
} from "ckeditor5/src/ui";
import { KeystrokeHandler, FocusTracker } from "ckeditor5/src/utils";
import { icons } from "ckeditor5/src/core";
import "@ckeditor/ckeditor5-table/theme/form.css";
import "@ckeditor/ckeditor5-table/theme/tableform.css";
import "@ckeditor/ckeditor5-table/theme/tablecellproperties.css";
import {
  createButton,
  createContainer,
  createRow,
  createSelect,
} from "../../utils/utils";

/**
 * The class representing a table cell properties form, allowing users to customize
 * certain style aspects of a table cell, for instance, border, padding, text alignment, etc..
 */
export default class TableCellWsPropertiesView extends View {
  constructor(locale, options) {
    super(locale);

    const t = locale.t;

    this.focusTracker = new FocusTracker();
    this.keystrokes = new KeystrokeHandler();

    this.classSelect = createSelect(
      t("Cell WS properties"),
      this._getPropertiesOptions(t),
      locale
    );

    this.saveButtonView = createButton(
      t("Save"),
      icons.check,
      "ck-button-save",
      locale
    );
    this.saveButtonView.type = "submit";

    this.cancelButtonView = createButton(
      t("Cancel"),
      icons.cancel,
      "ck-button-cancel",
      locale
    );

    this.cancelButtonView.delegate("execute").to(this, "cancel");

    this._focusables = new ViewCollection();

    this._focusCycler = new FocusCycler({
      focusables: this._focusables,
      focusTracker: this.focusTracker,
      keystrokeHandler: this.keystrokes,
      actions: {
        focusPrevious: "shift + tab",
        focusNext: "tab",
      },
    });

    this.setTemplate({
      tag: "form",
      attributes: {
        class: ["ck", "ck-webspark-form"],
        tabindex: "-1",
      },
      children: [
        createRow(this.classSelect),
        createContainer(
          [this.saveButtonView, this.cancelButtonView],
          ["ck-webspark-form-buttons"]
        ),
      ],
    });
  }

  _getPropertiesOptions(t) {
    return [
      {
        value: "td",
        title: t("Data"),
      },
      {
        value: `th`,
        title: t("Header"),
      },
      {
        value: `indent`,
        title: t("Padded header"),
      },
      {
        value: `normal`,
        title: t("Normal text header"),
      },
    ];
  }

  render() {
    super.render();

    submitHandler({
      view: this,
    });

    // TODO: Check why focus isn't working for a custom view
    const childViews = [
      this.classSelect.children[1],

      this.saveButtonView,
      this.cancelButtonView,
    ];

    childViews.forEach((v) => {
      // Register the view as focusable.
      this._focusables.add(v);

      // Register the view in the focus tracker.
      this.focusTracker.add(v.element);
    });

    // Start listening for the keystrokes coming from #element.
    this.keystrokes.listenTo(this.element);

    const stopPropagation = (data) => data.stopPropagation();

    // Since the form is in the dropdown panel which is a child of the toolbar, the toolbar's
    // keystroke handler would take over the key management in the URL input. We need to prevent
    // this ASAP. Otherwise, the basic caret movement using the arrow keys will be impossible.
    this.keystrokes.set("arrowright", stopPropagation);
    this.keystrokes.set("arrowleft", stopPropagation);
    this.keystrokes.set("arrowup", stopPropagation);
    this.keystrokes.set("arrowdown", stopPropagation);
  }

  destroy() {
    super.destroy();

    this.focusTracker.destroy();
    this.keystrokes.destroy();
  }

  focus() {
    this._focusCycler.focusFirst();
  }

  get classselect() {
    return this.classSelect.children[1].value;
  }

  set classselect(classselect) {
    this.classSelect.children[1].value = classselect;
  }

  setValues(values) {
    this.classselect = values?.classselect;
  }

  isValid() {
    return true;
  }
}
function isBorderStyleSet(value) {
  return value !== "none";
}
