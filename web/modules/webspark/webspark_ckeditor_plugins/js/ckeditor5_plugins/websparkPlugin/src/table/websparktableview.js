import { icons } from "ckeditor5/src/core";
import {
  FocusCycler,
  Model,
  View,
  ViewCollection,
  submitHandler,
} from "ckeditor5/src/ui";
import {
  Collection,
  FocusTracker,
  KeystrokeHandler,
} from "ckeditor5/src/utils";

import {
  createButton,
  createContainer,
  createInput,
  createRow,
  createSelect,
} from "../utils/utils";

export class WebsparkTableFormView extends View {
  DEFAULT_ROWS = "3";
  DEFAULT_COLS = "2";
  DEFAULT_HEADER = "none";
  DEFAULT_TYPE = "default";

  constructor(validators, locale) {
    super(locale);

    const t = locale.t;

    this.focusTracker = new FocusTracker();
    this.keystrokes = new KeystrokeHandler();

    this.textInputRowsView = createInput(t("Rows"), locale);
    this.textInputColsView = createInput(t("Columns"), locale);
    this.headersSelect = createSelect(
      t("Headers"),
      this._getHeaderOptions(t),
      locale
    );
    this.tabletypeSelect = createSelect(
      t("Table Type"),
      this._getTableTypeOptions(t),
      locale
    );
    this.textCaption = createInput(t("Caption"), locale);

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

    this._validators = validators;

    this.setTemplate({
      tag: "form",
      attributes: {
        class: ["ck", "ck-webspark-form"],
        tabindex: "-1",
      },
      children: [
        createRow(this.textInputRowsView),
        createRow(this.textInputColsView),
        createRow(this.headersSelect),
        createRow(this.tabletypeSelect),
        createRow(this.textCaption),
        createContainer(
          [this.saveButtonView, this.cancelButtonView],
          ["ck-webspark-form-buttons"]
        ),
      ],
    });
  }

  render() {
    super.render();

    submitHandler({
      view: this,
    });

    // TODO: Check why focus isn't working for a custom view
    const childViews = [
      this.textInputRowsView.children[1],
      this.textInputColsView.children[1],
      this.headersSelect.children[1],
      this.tabletypeSelect.children[1],
      this.textCaption.children[1],
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

  get rows() {
    return this.textInputRowsView.children[1].element.value.trim();
  }

  set rows(rows) {
    this.textInputRowsView.children[1].element.value = rows.trim();
  }

  get cols() {
    return this.textInputColsView.children[1].element.value.trim();
  }

  set cols(cols) {
    this.textInputColsView.children[1].element.value = cols.trim();
  }

  get headers() {
    return this.headersSelect.children[1].value;
  }

  set headers(header) {
    this.headersSelect.children[1].value = header;
  }

  get tabletype() {
    return this.tabletypeSelect.children[1].value;
  }

  set tabletype(ttype) {
    this.tabletypeSelect.children[1].value = ttype;
  }

  set caption(text) {
    this.textCaption.children[1].element.value = text.trim();
  }

  get caption() {
    return this.textCaption.children[1].element.value.trim();
  }

  setValues(values) {
    this.rows = values?.rows || this.DEFAULT_ROWS;
    this.cols = values?.cols || this.DEFAULT_COLS;
    this.headers = values?.headers || this.DEFAULT_HEADER;
    this.tabletype = values?.tabletype || this.DEFAULT_TYPE;
    this.caption = values?.caption || "";
  }

  isValid() {
    this.resetFormStatus();

    for (const validator of this._validators) {
      const errorText = validator(this);

      if (errorText) {
        if (errorText.includes("text")) {
          this.textInputRowsView.errorText = errorText;
        } else if (errorText.includes("URL")) {
          this.textInputColsView.errorText = errorText;
        }
        return false;
      }
    }

    return true;
  }

  resetFormStatus() {
    this.textInputRowsView.errorText = null;
    this.textInputColsView.errorText = null;
  }

  /**
   * Generates an array of header options.
   *
   * @param {string} t - The translation function.
   * @return {Array} An array of header options.
   */
  _getHeaderOptions(t) {
    return [
      {
        value: "none",
        title: t("None"),
      },
      {
        value: "row",
        title: t("First row"),
      },
      {
        value: "column",
        title: t("First column"),
      },
      {
        value: "both",
        title: t("Both"),
      },
    ];
  }

  /**
   * Retrieves the table type options.
   *
   * @param {type} t - the translation function
   * @return {Array} an array of table type options
   */
  _getTableTypeOptions(t) {
    return [
      {
        value: "default",
        title: t("Default"),
      },
      {
        value: "fixed",
        title: t("Fixed"),
      },
    ];
  }
}

function prepareListOptions(options) {
  const itemDefinitions = new Collection();

  // Create dropdown items.
  for (const option of options) {
    const def = {
      type: "button",
      model: new Model({
        commandName: "websparkTable",
        commandParam: option.model,
        label: option.title,
        withText: true,
        value: option.value,
      }),
    };

    itemDefinitions.add(def);
  }
  return itemDefinitions;
}
