/**
 * @file registers the websparkTable toolbar button and binds functionality to it.
 */

import { Plugin } from "ckeditor5/src/core";
import { ContextualBalloon, createDropdown } from "ckeditor5/src/ui";
import icon from "../../../../../icons/websparktable.svg";
import { WebsparkTableFormView } from "./websparktableview";

export default class WebsparkTableUI extends Plugin {
  static get requires() {
    return [ContextualBalloon];
  }

  init() {
    const editor = this.editor;
    const command = editor.commands.get("insertWebsparkTable");

    this.form = new WebsparkTableFormView(
      getFormValidators(editor.t),
      editor.locale,
      command
    );

    editor.ui.componentFactory.add("websparkTable", (locale) => {
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
    const commando =  this.editor.commands.get('insertTable');

    dropdown.bind("isEnabled").to(command);
    dropdown.panelView.children.add(form);

    button.set({
      label: t("Webspark table"),
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
        form.textInputRowsView.children[1].select();

        form.focus();
      },
      { priority: "low" }
    );

    dropdown.on("submit", () => {
      if (form.isValid()) {
       editor.execute("insertWebsparkTable", {
          rows: form.rows,
          cols: form.cols,
          headers: form.headers,
          tabletype: form.tabletype,
          caption: form.caption,
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
    (form) => {
      if (!form.rows.length) {
        return t("The rows field must not be empty.");
      }
      if (!form.cols.length) {
        return t("The cols field must not be empty.");
      }
    },
  ];
}
