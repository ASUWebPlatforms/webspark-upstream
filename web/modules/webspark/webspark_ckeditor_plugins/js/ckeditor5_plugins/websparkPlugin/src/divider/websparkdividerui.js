/**
 * @file registers the websparkDivider toolbar button and binds functionality to it.
 */

import { Plugin } from "ckeditor5/src/core";
import {
  ButtonView,
} from "ckeditor5/src/ui";
import icon from "../../../../../icons/websparkDivider.svg";
import { Collection } from "ckeditor5/src/utils";

export default class WebsparkDividerUI extends Plugin {
  init() {
    const editor = this.editor;
    const t = editor.t;
  
    editor.ui.componentFactory.add("websparkDivider", (locale) => {
      const command = editor.commands.get("insertWebsparkDivider");
      const buttonView = new ButtonView(locale);

      // Create the toolbar button.
      buttonView.set({
        label: editor.t("Divider"),
        icon,
        tooltip: true,
      });

      // Bind the state of the button to the command.
      buttonView.bind("isOn", "isEnabled").to(command, "value", "isEnabled");

      // Execute the command when the button is clicked (executed).
      this.listenTo(buttonView, "execute", () =>
        editor.execute("insertWebsparkDivider")
      );

      return buttonView;
    });
  }
}
