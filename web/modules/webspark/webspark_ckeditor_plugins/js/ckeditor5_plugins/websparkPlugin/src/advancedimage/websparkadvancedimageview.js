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
  createRow,
  createSelect,
} from "../utils/utils";

export class WebsparkAdvancedImageFormView extends View {


  constructor(validators, locale) {
    super(locale);
    const t = locale.t;
    this.focusTracker = new FocusTracker();
    this.keystrokes = new KeystrokeHandler();

    this.spacingTopSelect = createSelect(
      t("Spacing top"),
      this._getSpacingOptions(t, 'top'),
      locale
    );

    this.spacingBottomSelect = createSelect(
      t("Spacing bottom"),
      this._getSpacingOptions(t, 'bottom'),
      locale
    );

    this.spacingLeftSelect = createSelect(
      t("Spacing left"),
      this._getSpacingOptions(t, 'left'),
      locale
    );

    this.spacingRightSelect = createSelect(
      t("Spacing right"),
      this._getSpacingOptions(t, 'right'),
      locale
    );

    this.roundedImage = createSelect(
      t('Round image'),
      [
        {
          value: "none",
          title: t("No"),
        },
        {
          value: `rounded-circle`,
          title: t("Yes"),
        }
      ],
      locale
    )

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
        createRow(this.spacingTopSelect),
        createRow(this.spacingBottomSelect),
        createRow(this.spacingLeftSelect),
        createRow(this.spacingRightSelect),
        createRow(this.roundedImage),
        createContainer(
          [this.saveButtonView, this.cancelButtonView],
          ["ck-webspark-form-buttons"]
        ),
      ],
    });
  }

  /**
   * Generates an array of spacing options based on the given position.
   *
   * @param {type} t - A function for translating strings.
   * @param {type} position - The position of the spacing options.
   * @return {type} An array of spacing options.
   */
  _getSpacingOptions(t, position) {
    return [
      {
        value: "none",
        title: t("None"),
      },
      {
        value: `spacing-${position}-8`,
        title: t("8px"),
      },
      {
        value: `spacing-${position}-16`,
        title: t("16px"),
      },
      {
        value: `spacing-${position}-24`,
        title: t("24px"),
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
      this.spacingTopSelect.children[1],
      this.spacingBottomSelect.children[1],
      this.spacingLeftSelect.children[1],
      this.spacingRightSelect.children[1],
      this.roundedImage.children[1],

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

  get spacingtop() {
    return this.spacingTopSelect.children[1].value;
  }

  set spacingtop(spacingtop) {
    this.spacingTopSelect.children[1].value = spacingtop;
  }

  get spacingbottom() {
    return this.spacingBottomSelect.children[1].value;
  }

  set spacingbottom(spacingbottom) {
    this.spacingBottomSelect.children[1].value = spacingbottom;
  }

  get spacingright() {
    return this.spacingRightSelect.children[1].value;
  }

  set spacingright(spacingright) {
    this.spacingRightSelect.children[1].value = spacingright;
  }

  get spacingleft() {
    return this.spacingLeftSelect.children[1].value;
  }

  set spacingleft(spacingleft) {
    this.spacingLeftSelect.children[1].value = spacingleft;
  }

  get roundedimage() {
    return this.roundedImage.children[1].value;
  }

  set roundedimage(spacingleft) {
    this.roundedImage.children[1].value = spacingleft;
  }

  setValues(values) {
    this.spacingtop = values?.spacingTop;
    this.spacingbottom = values?.spacingBottom;
    this.spacingleft = values?.spacingLeft;
    this.spacingright = values?.spacingRight;
    this.roundedimage = values?.roundedImage;
  }

  isValid() {
    return true;
  }
}

/**
 * Generates a list of dropdown items based on the given options.
 *
 * @param {Array} options - An array of objects representing the dropdown options.
 * Each object should have the following properties:
 *   - model: The command parameter for the dropdown item.
 *   - title: The label to display for the dropdown item.
 *   - value: The value of the dropdown item.
 * @return {Collection} - A Collection object containing the generated dropdown items.
 */
function prepareListOptions(options) {
  const itemDefinitions = new Collection();

  // Create dropdown items.
  for (const option of options) {
    const def = {
      type: "button",
      model: new Model({
        commandName: "websparkAdvancedImage",
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
