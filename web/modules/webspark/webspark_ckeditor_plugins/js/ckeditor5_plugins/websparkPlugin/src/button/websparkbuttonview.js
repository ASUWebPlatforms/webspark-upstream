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

export class WebsparkButtonFormView extends View {
  DEFAULT_TEXT = "Button";
  DEFAULT_HREF = "#";
  DEFAULT_STYLE = "gold";
  DEFAULT_SIZE = "default";
  DEFAULT_TARGET = "unset";

  constructor(validators, locale) {
    super(locale);

    const t = locale.t;

    this.focusTracker = new FocusTracker();
    this.keystrokes = new KeystrokeHandler();

    this.textInputView = createInput(t("Text"), locale);
    this.urlInputView = createInput(t("URL"), locale);
    this.styleSelect = createSelect(
      t("Style"),
      this._getStyleOptions(t),
      locale
    );
    this.sizeSelect = createSelect(t("Size"), this._getSizeOptions(t), locale);
    this.targetSelect = createSelect(
      t("Target"),
      this._getTargetOptions(t),
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
        class: ["ck", "ck-webspark-form"],
        tabindex: "-1",
      },
      children: [
        createRow(this.textInputView, this.urlInputView),
        createRow(this.styleSelect, this.sizeSelect, this.targetSelect),
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
      this.urlInputView.children[1],
      this.styleSelect.children[1],
      this.sizeSelect.children[1],
      this.targetSelect.children[1],
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

  get href() {
    return this.urlInputView.children[1].element.value.trim();
  }

  set href(url) {
    this.urlInputView.children[1].element.value = url.trim();
  }

  get styles() {
    return this.styleSelect.children[1].value;
  }

  set styles(styles) {
    this.styleSelect.children[1].value = styles;
  }

  get size() {
    return this.sizeSelect.children[1].value;
  }

  set size(size) {
    this.sizeSelect.children[1].value = size;
  }

  get target() {
    return this.targetSelect.children[1].value;
  }

  set target(target) {
    this.targetSelect.children[1].value = target;
  }

  setValues(values) {
    this.text = values?.text || this.DEFAULT_TEXT;
    this.href = values?.href || this.DEFAULT_HREF;
    this.styles = values?.styles || this.DEFAULT_STYLE;
    this.size = values?.size || this.DEFAULT_SIZE;
    this.target = values?.target || this.DEFAULT_TARGET;
  }

  isValid() {
    this.resetFormStatus();
    for (const validator of this._validators) {
      const errorText = validator(this);
      if (errorText) {
        if (errorText.includes("text")) {
          this.textInputView.errorText = errorText;
        } else if (errorText.includes("URL")) {
          this.urlInputView.errorText = errorText;
        }
        return false;
      }
    }

    return true;
  }

  resetFormStatus() {
    this.textInputView.errorText = null;
    this.urlInputView.errorText = null;
  }

  _getStyleOptions(t) {
    return [
      {
        value: "gold",
        title: t("Button Gold"),
      },
      {
        value: "maroon",
        title: t("Button Maroon"),
      },
      {
        value: "gray",
        title: t("Button Gray 2"),
      },
      {
        value: "dark",
        title: t("Button Gray 7"),
      },
    ];
  }

  _getSizeOptions(t) {
    return [
      {
        value: "default",
        title: t("Default"),
      },
      {
        value: "md",
        title: t("Medium"),
      },
      {
        value: "sm",
        title: t("Small"),
      },
    ];
  }

  _getTargetOptions(t) {
    return [
      {
        value: "",
        title: t("Not set"),
      },
      {
        value: "_blank",
        title: t("New window (_blank)"),
      },

      {
        value: "_top",
        title: t("Topmost window (_top)"),
      },

      {
        value: "_self",
        title: t("Same window (_self)"),
      },

      {
        value: "_parent",
        title: t("Parent window (_parent)"),
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
        commandName: "websparkButton",
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
