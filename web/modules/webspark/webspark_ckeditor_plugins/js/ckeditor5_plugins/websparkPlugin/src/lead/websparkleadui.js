/**
 * @file registers the websparkLead toolbar button and binds functionality to it.
 */

import { Plugin } from "ckeditor5/src/core";
import { ContextualBalloon, createDropdown } from "ckeditor5/src/ui";
import icon from "../../../../../icons/websparklead.svg";
import { WebsparkLeadFormView } from "./websparkleadview";

export default class WebsparkLeadUI extends Plugin {
  static get requires() {
    return [ContextualBalloon];
  }

  init() {
    const editor = this.editor;
    const command = editor.commands.get("insertWebsparkLead");

    this.form = new WebsparkLeadFormView(
      getFormValidators(editor.t),
      editor.locale,
      command
    );

    editor.ui.componentFactory.add("websparkLead", (locale) => {
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
      label: t("Lead"),
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
        form.textInputView.children[1].element.select();
      },
      { priority: "low" }
    );

    dropdown.on("submit", () => {
      if (form.isValid()) {
        editor.execute("insertWebsparkLead", {
          text: form.text,
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
