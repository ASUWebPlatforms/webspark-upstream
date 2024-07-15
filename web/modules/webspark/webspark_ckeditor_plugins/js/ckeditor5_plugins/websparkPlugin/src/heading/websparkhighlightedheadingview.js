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
  createTextArea
} from "../utils/utils";

export class WebsparkHighlightedHeadingFormView extends View {
  DEFAULT_TEXT = "";
  DEFAULT_STYLE = "gold";
  DEFAULT_HEADING = "h1";

  constructor(validators, locale) {
    super(locale);

    const t = locale.t;

    this.focusTracker = new FocusTracker();
    this.keystrokes = new KeystrokeHandler();

    this.textInputView = createTextArea(t("Content"), locale);
    this.styleSelect = createSelect(
      t("Style"),
      this._getStyleOptions(t),
      locale
    );
    this.headingSelect = createSelect(
      t("Heading"),
      this._getHeadingOptions(t),
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

    this._validators = validators;

    this.setTemplate({
      tag: "form",
      attributes: {
        class: ["ck", "ck-webspark-form", "webspark-heading-dialog"],
        tabindex: "-1",
      },
      children: [
        createRow(this.textInputView),
        createRow(this.styleSelect, this.headingSelect),
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
      this.textInputView.children[1],
      this.styleSelect.children[1],
      this.headingSelect.children[1],
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

  get text() {
    return this.textInputView.children[1].element.value.trim();
  }

  set text(text) {
    this.textInputView.children[1].element.value = text.trim();
  }

  get styles() {
    return this.styleSelect.children[1].value;
  }

  set styles(styles) {
    this.styleSelect.children[1].value = styles;
  }

  get heading() {
    return this.headingSelect.children[1].value;
  }

  set heading(heading) {
    this.headingSelect.children[1].value = heading;
  }

  setValues(values) {
    this.text = values?.text || this.DEFAULT_TEXT;
    this.styles = values?.styles || this.DEFAULT_STYLE;
    this.heading = values?.heading || this.DEFAULT_HEADING;
  }

  isValid() {
    return true;
    this.resetFormStatus();

    for (const validator of this._validators) {
      const errorText = validator(this);

      if (errorText) {
        if (errorText.includes("text")) {
          this.textInputView.errorText = errorText;
        }

        return false;
      }
    }

    return true;
  }

  resetFormStatus() {
    this.textInputView.errorText = null;
  }

  /**
   * Generates an array of style options.
   *
   * @param {function} t - the translation function
   * @return {array} an array of style options
   */
  _getStyleOptions(t) {
    return [
      {
        value: "gold",
        title: t("Gold Highlight"),
      },
      {
        value: "black",
        title: t("Gray 7 Highlight"),
      },
      {
        value: "white",
        title: t("White Highlight"),
      },
    ];
  }

  /**
   * Generates an array of heading options.
   *
   * @param {type} t - a function used for translation
   * @return {Array} an array of heading options
   */
  _getHeadingOptions(t) {
    return [
      {
        value: "h2",
        title: t("H2"),
      },

      {
        value: "h3",
        title: t("H3"),
      },

      {
        value: "h4",
        title: t("H4"),
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
        commandName: "websparkHighlightedHeading",
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
