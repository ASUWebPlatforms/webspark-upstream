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
  createTextArea,
} from "../utils/utils";

export class WebsparkBlockquoteFormView extends View {
  DEFAULT_TEXT = "";
  DEFAULT_STYLE = "";
  DEFAULT_HEADING = "";

  constructor(validators, locale) {
    super(locale);

    const t = locale.t;

    this.focusTracker = new FocusTracker();
    this.keystrokes = new KeystrokeHandler();

    this.textInputView = createTextArea(t("Content"), locale);
    this.citationNameView = createInput(t("Citation Name"), locale);
    this.citationDescriptionView = createInput(t("Citation Description"), locale);

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
        class: ["ck", "ck-webspark-form","webspark-blockquote-dialog"],
        tabindex: "-1",
      },
      children: [
        createRow(this.textInputView),
        createRow(this.citationNameView),
        createRow(this.citationDescriptionView),
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
      this.citationNameView.children[1],
      this.citationDescriptionView.children[1],
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

  get citationName() {
    return this.citationNameView.children[1].element.value.trim();
  }

  set citationName(text) {
    this.citationNameView.children[1].element.value = text.trim();
  }

  get citationDescription() {
    return this.citationDescriptionView.children[1].element.value.trim();
  }

  set citationDescription(text) {
    this.citationDescriptionView.children[1].element.value = text.trim();
  }

  setValues(values) {
    this.text = values?.text || this.DEFAULT_TEXT;
    this.citationName = values?.citationName || this.DEFAULT_STYLE;
    this.citationDescription = values?.citationDescription || this.DEFAULT_HEADING;
  }

  isValid() {
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
}

function prepareListOptions(options) {
  const itemDefinitions = new Collection();

  // Create dropdown items.
  for (const option of options) {
    const def = {
      type: "button",
      model: new Model({
        commandName: "websparkBlockquote",
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
