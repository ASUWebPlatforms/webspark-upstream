import {
  ButtonView,
  InputTextView,
  LabelView,
  createDropdown as _createDropdown,
  addListToDropdown,
  TextareaView,
} from "ckeditor5/src/ui";
import { SelectView } from "./selectview";
// import { TextAreaView } from "./textareaview";

// Creates a container element with specified children and CSS classes.
export function createContainer(children, classes = []) {
  return {
    tag: "div",
    attributes: { class: ["ck-webspark-form-container", ...classes] },
    children,
  };
}

// Creates a row element with specified children.
export function createRow(...children) {
  return {
    tag: "div",
    attributes: { class: ["ck-webspark-form-row"] },
    children,
  };
}

// Creates a select input element with a label and options.
export function createSelect(label, options, locale) {
  const labelView = new LabelView(locale);
  const selectView = new SelectView(locale, options, options[0].value);

  labelView.text = label;

  // Wraps the label and select input in a container.
  return createContainer([labelView, selectView]);
}

// Creates an input element with a label.
export function createInput(label, locale) {
  const labelView = new LabelView(locale);
  const inputTextView = new InputTextView(locale);
  const errorView = new LabelView();

  labelView.text = label;

  errorView.text = '';

  // Wraps the label and input in a container.
  return createContainer([labelView, inputTextView, errorView]);
}

// Creates a button element with label, icon, and CSS class.
export function createButton(label, icon, className, locale) {
  const button = new ButtonView(locale);

  button.set({
    label,
    icon,
    tooltip: true,
  });

  // Adds CSS class to the button element.
  button.extendTemplate({
    attributes: {
      class: className,
    },
  });

  return button;
}

// Creates a dropdown element with label, options, and callback for item selection.
export function createDropdown(label, options, locale, onExecute) {
  const dropdown = _createDropdown(locale);

  // Adds options to the dropdown.
  addListToDropdown(dropdown, prepareListOptions(options));

  // Sets the label for the dropdown button.
  dropdown.buttonView.set({
    label: locale.t(label),
    withText: true,
  });

  // Listens for item selection and executes the callback.
  this.listenTo(dropdown, "execute", (item) => {
    onExecute(item);
    dropdown.buttonView.set("label", item.source.label);
  });

  return dropdown;
}

// Extracts data from classes and returns a default value if no matching class is found.
export function extractDataFromClasses(classes, data, defaultValue = "default") {
  if (!isObjectEmpty(data)) {
    for (const className in data) {
      if (classes.includes(className)) {
        return data[className];
      }
    }
  }
  return defaultValue;
}

export function createTextArea(label, locale) {
  const labelView = new LabelView(locale);
  const textAreaView = new TextareaView(locale);

  labelView.text = label;

  return createContainer([labelView, textAreaView]);
}
const isObjectEmpty = (objectName) => {
  return Object.keys(objectName).length === 0
}

export function createLabel(label, locale) {
  const labelView = new LabelView(locale);
  labelView.text = label;
  return labelView;
}
