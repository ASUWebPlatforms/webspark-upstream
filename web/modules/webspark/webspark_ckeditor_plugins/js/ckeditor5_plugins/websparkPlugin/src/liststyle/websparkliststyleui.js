import {Plugin, Range} from "ckeditor5/src/core";
import {
  clickOutsideHandler,
  ContextualBalloon,
  createDropdown,
} from "ckeditor5/src/ui";
import {WebsparkListStyleFormView} from "./websparklistsyleview";
import icon from "../../../../../icons/websparkListStyle.svg";
import {_getBulletedPropertiesOptions, _getNumberedPropertiesOptions, _setUpClassSelect} from "./utils";

export default class WebsparkListStyleUI extends Plugin {
  static get requires() {
    return [ContextualBalloon];
  }

  /**
   * Initializes the WebsparkListStyleUI plugin.
   * This function sets up the user interface elements and interactions.
   */
  init() {
    const editor = this.editor;
    const command = editor.commands.get("insertliststyle");

    this.form = new WebsparkListStyleFormView(
      getFormValidators(this.editor.t),
      this.editor.locale,
      command
    );

    const viewDocument = this.editor.editing.view.document;
    this.listenTo(viewDocument, "click", () => {
      _setUpClassSelect(this.form, this.editor);
    });

    this.listenTo(viewDocument, "change", () => {
      _setUpClassSelect(this.form, this.editor);
    });

    editor.ui.componentFactory.add("websparkListStyle", () => {
      const dropdown = createDropdown(editor.locale);
      this._setUpDropdown(dropdown, this.form);
      this._setUpForm(this.form, dropdown, command);

      const command1 = this.editor.commands.get("bulletedListOld");
      const command2 = this.editor.commands.get("numberedListOld");
      dropdown.bind( 'isEnabled' ).toMany( [command1, command2], 'value', value => {
        return command1.value || command2.value;
      } );

      return dropdown;
    });
  }

  /**
   * Recursively find the parent 'ul' element of the given element.
   *
   * @param {Element} element - The current element to start the search from.
   * @returns {Element|null} The 'ul' element found in the hierarchy, or null if not found.
   * @private
   */
  _findUlParent(element) {
    if (!element || !element.parent) {
      return null;
    }
    if (element.name === "ul") {
      return element;
    }
    return this._findUlParent(element.parent);
  }

  /**
   * Set up the dropdown with the form, command, and balloon.
   *
   * @param {Dropdown} dropdown - The dropdown instance to set up.
   * @param {WebsparkListStyleFormView} form - The form instance to include in the dropdown.
   * @param {Command} command - The CKEditor command associated with list style insertion.
   * @param {ContextualBalloon} balloon - The ContextualBalloon instance to interact with.
   * @private
   */
  _setUpDropdown(dropdown, form) {
    const editor = this.editor;
    const t = editor.t;
    const button = dropdown.buttonView;

    dropdown.panelView.children.add(form);

    button.set({
      label: t("List Properties"),
      icon: icon,
      tooltip: true,
    });

    button.on(
      "open",
      () => {
        try {
          if(form.classselect) {
            form.classselect.children[1].select();
          }
        } catch (e) {}

        form.focus();
      },
      {priority: "low"}
    );

    dropdown.on("submit", () => {
      editor.execute("insertliststyle", {
        styleClass: form.classselect,
      });
      closeUI();
    });

    dropdown.on("change:isOpen", () => form.element.reset());
    dropdown.on("cancel", () => closeUI());

    function closeUI() {
      editor.editing.view.focus();
      dropdown.isOpen = false;
    }
  }

  /**
   * Set up the form's interaction with the dropdown and command.
   *
   * @param {WebsparkListStyleFormView} form - The form instance to set up.
   * @param {Dropdown} dropdown - The dropdown instance associated with the form.
   * @param {Command} command - The CKEditor command associated with list style insertion.
   * @private
   */
  _setUpForm(form, dropdown, command) {
    form.delegate("submit", "cancel").to(dropdown);
    form.saveButtonView.bind("isEnabled").to(command);
  }
}

function getFormValidators(t) {
  return [];
}
