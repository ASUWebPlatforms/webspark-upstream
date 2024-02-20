/**
 * @file registers the websparkHighlightedHeading toolbar button and binds functionality to it.
 */

import { Plugin } from "ckeditor5/src/core";
import { ContextualBalloon, createDropdown } from "ckeditor5/src/ui";
import icon from "../../../../../icons/websparkHighlightedHeading.svg";
import { WebsparkHighlightedHeadingFormView } from "./websparkhighlightedheadingview";

export default class WebsparkHighlightedHeadingUI extends Plugin {
  static get requires() {
    return [ContextualBalloon];
  }

  init() {
    const editor = this.editor;
    const command = editor.commands.get("insertWebsparkHighlightedHeading");

    this.form = new WebsparkHighlightedHeadingFormView(
      getFormValidators(editor.t),
      editor.locale,
      command
    );

    editor.ui.componentFactory.add("websparkHighlightedHeading", (locale) => {
      const dropdown = createDropdown(locale);

      this._setUpDropdown(dropdown, this.form, command);
      this._setUpForm(this.form, dropdown, command);

      return dropdown;
    });
  }

  _setUpDropdown(dropdown, form, command) {
    const editor = this.editor;
    const t = editor.t;
    const button = dropdown.buttonView;

    dropdown.bind("isEnabled").to(command);
    dropdown.panelView.children.add(form);

    button.set({
      label: t("Highlighted Heading"),
      icon: icon,
      tooltip: true,
    });

    // Note: Use the low priority to make sure the following listener starts working after the
    // default action of the drop-down is executed (i.e. the panel showed up). Otherwise, the
    // invisible form/input cannot be focused/selected.
 
    button.on(
      "open",
      () => {
        form.setValues(command.value);
        form.textInputView.children[1].element.select() ;
      },
      { priority: "low" }
    );

    dropdown.on("submit", () => {
      if (form.isValid()) {
        editor.execute("insertWebsparkHighlightedHeading", {
          text: form.text,
          styles: form.styles,
          heading: form.heading,
        });

        closeUI();
      }
    });

    dropdown.on("change:isOpen", () => form.element.reset());
    dropdown.on("cancel", () => closeUI());

    function closeUI() {
      editor.editing.view.focus();
      dropdown.isOpen = false;
    }
  }

  _setUpForm(form, dropdown, command) {
    form.delegate("submit", "cancel").to(dropdown);
    form.saveButtonView.bind("isEnabled").to(command);
  }
}

function getFormValidators(t) {
  return [
    (form) => {}/*{
      if (!form.text.length) {
        return t("The text must not be empty.");
      }
    },*/
  ];
}
