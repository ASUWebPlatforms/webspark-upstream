/**
 * @file This is what CKEditor refers to as a master (glue) plugin. Its role is
 * just to load the “editing” and “UI” components of this Plugin. Those
 * components could be included in this file, but
 *
 * I.e, this file's purpose is to integrate all the separate parts of the plugin
 * before it's made discoverable via index.js.
 */

import {Plugin} from "ckeditor5/src/core";
import {ContextualBalloon} from "ckeditor5/src/ui";
import InsertWebsparkListStyleCommand from "./insertliststylecommand";
import {Widget} from "ckeditor5/src/widget";
import {first} from "ckeditor5/src/utils";
import {_getSibling, _initUdsListClass, _test} from "./utils";
//
export default class WebsparkListStyleEditing extends Plugin {

  static get requires() {
    return [
      Widget,
      ContextualBalloon,
    ];
  }

  /**
   * @inheritdoc
   */
  static get pluginName() {
    return 'WebsparkListStyleEditing';
  }

  constructor(editor) {
    super(editor);
  }

  init() {
    const editor = this.editor;
    const {model} = this.editor;
    editor.commands.add(
      "insertliststyle",
      new InsertWebsparkListStyleCommand(editor)
    );

    editor.commands.add(
      "bulletedListOld",
      editor.commands.get('bulletedList')
    );
    const customBulletedListCommand = {
      execute: function (value) {
        // Call the original bulletedList command.
        editor.execute('bulletedListOld', value);
        _initUdsListClass(model);
      }
    };
    // Register custom commands.
    editor.commands.add('bulletedList', customBulletedListCommand);
    editor.commands.get('bulletedList').isEnabled = true;

    editor.commands.add(
      "numberedListOld",
      editor.commands.get('numberedList')
    );
    const customNumberedListCommand = {
      execute: function (value) {
        // Call the original numberedList command.
        editor.execute('numberedListOld', value);
        _initUdsListClass(model);
      }
    };
    // Register custom commands.
    editor.commands.add('numberedList', customNumberedListCommand);
    editor.commands.get('numberedList').isEnabled = true;
  }
}
