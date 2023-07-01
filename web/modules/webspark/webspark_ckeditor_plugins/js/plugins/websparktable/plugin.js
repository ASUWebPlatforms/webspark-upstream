/**
 * @file
 * Responsive table plugin.
 */

CKEDITOR.plugins.add('websparkTable', {
  requires: 'dialog,table',

  // Must be the same name of editor.ui.addButton('thisName')
  // Is case insensitive.
  icons: 'websparkTable',

  init: function (editor) {

    CKEDITOR.dialog.add('websparktable', this.path + 'dialog/websparktable.js');
    editor.addCommand('websparktable', new CKEDITOR.dialogCommand('websparktable'));

    // When an elements is inserted we want to put the cursor on the first cell.
    editor.on('insertElement', function (payload) {
      let element = payload.data;
      if (isTable(element)) {
        moveCursorToCel(0, 0, element, editor);
        editor.fire('change');
      }

    });

    // Add a trigger when the menu is hidden.
    editor.contextMenu._.onHide = function () {
      editor.fire( 'menuHide' );
    }

    // On contextual menu (right click) show, make it impossible to scroll.
    editor.on('menuShow', function (data) {
      jQuery("body").css("overflow", "hidden");
      jQuery("#drupal-off-canvas").css("overflow", "hidden");
    });

    // On contextual menu (right click) hide return to normal scrolling.
    editor.on('menuHide', function (data) {
      jQuery("#drupal-off-canvas").css("overflow", "auto");
      jQuery("body").css("overflow", "auto");
    });

    CKEDITOR.on('dialogDefinition', function (ev) {
      // Take the dialog name and its definition from the event data.
      var dialogName = ev.data.name;
      var dialogDefinition = ev.data.definition;

      // Add posibility to customize the table cell.
      if (dialogName == 'cellProperties') {
        var infoTab = dialogDefinition.getContents('info');
        // Remove the default behaviour
        infoTab.remove('cellType');
        var $element = {
          id: 'cellType',
          type: 'select',
          label: 'Cell Type',
          items: [
            ['Data', 'td'],
            ['Header', 'th'],
            ['Padded header', 'indent'],
            ['Normal text header', 'normal'],
          ],
          setup: function (element) {
            // Default value;
            this.setValue('th');
            if (element[0].getName() == 'td') {
              this.setValue('td');
            } else {
              if (element[0].hasClass('indent')) {
                this.setValue('indent');
              }
              if (element[0].hasClass('normal')) {
                this.setValue('normal');
              }
            }
          },
          commit: function (element) {
            element.removeClass('indent');
            element.removeClass('normal');
            if (this.getValue() == 'td' || this.getValue() == 'th') {
              element.renameNode(this.getValue());
            } else {
              element.renameNode('th');
              element.addClass(this.getValue());
            }

          },
        };
        infoTab.add($element);
      }

      // Check if the definition is from the dialog window you are interested
      // in (the "tableProperties" dialog window).
      if (dialogName == 'tableProperties' || dialogName == 'table') {
        // Get a reference to the "Table Properties" tab.
        var infoTab = dialogDefinition.getContents('info');

        // Remove the Caption from the default table icon
        infoTab.remove('txtCaption');
        infoTab.remove('type');
        var $element = {
          id: 'type',
          type: 'select',
          label: 'Table Type',
          items: [
            ['Default', 'default'],
            ['Fixed', 'fixed']
          ],
          setup: function (element) {
            if (element.getParent().hasClass('uds-table-fixed')) {
              this.setValue('fixed');
            } else {
              this.setValue('default');
            }

          },
          commit: function (data) {
            let id = this.id;

            if (!data.info) {
              data.info = {};
            }
            data.info[id] = this.getValue();
          },
        };
        infoTab.add($element);

        dialogDefinition.onOk = function () {
          var selection = editor.getSelection(),
                  bms = this._.selectedElement && selection.createBookmarks();

          var table = this._.selectedElement || makeElement('table'),
                  data = {};

          this.commitContent(data, table);

          if (data.info) {
            var info = data.info;

            // Apply class to the parent
            var parent_div = table.getParent();
            if (info.type == 'fixed') {
              parent_div.addClass('uds-table-fixed');
            } else {
              parent_div.removeClass('uds-table-fixed');
            }
            // Generate the rows and cols.
            if (!this._.selectedElement) {
              var tbody = table.append(makeElement('tbody')),
                      rows = parseInt(info.txtRows, 10) || 0,
                      cols = parseInt(info.txtCols, 10) || 0;

              for (var i = 0; i < rows; i++) {
                var row = tbody.append(makeElement('tr'));
                for (var j = 0; j < cols; j++) {
                  var cell = row.append(makeElement('td'));
                  cell.appendBogus();
                }
              }
            }

            // Modify the table headers. Depends on having rows and cols generated
            // correctly so it can't be done in commit functions.

            // Should we make a <thead>?
            var headers = info.selHeaders;
            if (!table.$.tHead && (headers == 'row' || headers == 'both')) {
              var thead = table.getElementsByTag('thead').getItem(0);
              tbody = table.getElementsByTag('tbody').getItem(0);
              var theRow = tbody.getElementsByTag('tr').getItem(0);

              if (!thead) {
                thead = new CKEDITOR.dom.element('thead');
                thead.insertBefore(tbody);
              }

              // Change TD to TH:
              for (i = 0; i < theRow.getChildCount(); i++) {
                var th = theRow.getChild(i);
                // Skip bookmark nodes. (https://dev.ckeditor.com/ticket/6155)
                if (th.type == CKEDITOR.NODE_ELEMENT && !th.data('cke-bookmark')) {
                  th.renameNode('th');
                  th.setAttribute('scope', 'col');
                }
              }
              thead.append(theRow.remove());
            }

            if (table.$.tHead !== null && !(headers == 'row' || headers == 'both')) {
              // Move the row out of the THead and put it in the TBody:
              thead = new CKEDITOR.dom.element(table.$.tHead);
              tbody = table.getElementsByTag('tbody').getItem(0);

              while (thead.getChildCount() > 0) {
                theRow = thead.getFirst();
                for (i = 0; i < theRow.getChildCount(); i++) {
                  var newCell = theRow.getChild(i);
                  if (newCell.type == CKEDITOR.NODE_ELEMENT) {
                    newCell.renameNode('td');
                    newCell.removeAttribute('scope');
                  }
                }

                // Append the row to the start (#1397).
                tbody.append(theRow, true);
              }
              thead.remove();
            }

            // Should we make all first cells in a row TH?
            if (!this.hasColumnHeaders && (headers == 'col' || headers == 'both')) {
              for (row = 0; row < table.$.rows.length; row++) {
                newCell = new CKEDITOR.dom.element(table.$.rows[ row ].cells[ 0 ]);
                newCell.renameNode('th');
                newCell.setAttribute('scope', 'row');
              }
            }

            // Should we make all first TH-cells in a row make TD? If 'yes' we do it the other way round :-)
            if ((this.hasColumnHeaders) && !(headers == 'col' || headers == 'both')) {
              for (i = 0; i < table.$.rows.length; i++) {
                row = new CKEDITOR.dom.element(table.$.rows[ i ]);
                if (row.getParent().getName() == 'tbody') {
                  newCell = new CKEDITOR.dom.element(row.$.cells[ 0 ]);
                  newCell.renameNode('td');
                  newCell.removeAttribute('scope');
                }
              }
            }

            // Set the width and height.
            info.txtHeight ? table.setStyle('height', info.txtHeight) : table.removeStyle('height');
            info.txtWidth ? table.setStyle('width', info.txtWidth) : table.removeStyle('width');

            if (!table.getAttribute('style'))
              table.removeAttribute('style');
          }

          // Insert the table element if we're creating one.
          if (!this._.selectedElement) {
            editor.insertElement(table);
            // Override the default cursor position after insertElement to place
            // cursor inside the first cell (https://dev.ckeditor.com/ticket/7959), IE needs a while.
            setTimeout(function () {
              var firstCell = new CKEDITOR.dom.element(table.$.rows[ 0 ].cells[ 0 ]);
              var range = editor.createRange();
              range.moveToPosition(firstCell, CKEDITOR.POSITION_AFTER_START);
              range.select();
            }, 0);
          }
          // Properly restore the selection, (https://dev.ckeditor.com/ticket/4822) but don't break
          // because of this, e.g. updated table caption.
          else {
            try {
              selection.selectBookmarks(bms);
            } catch (er) {
            }
          }
        };
      }

    });

    // Add the button to the toolbar.
    editor.ui.addButton('WebsparkTable', {
      label: 'Webspark table',
      command: 'websparktable',
      icon: this.path + 'icons/websparkTable.png'
    });

    /**
     * Checks if the element is a responsive table.
     */
    function isTable(el) {
      return el.hasClass('uds-table');
    }

    /**
     * Relocates the caret into the first cell.
     *
     * @param posX
     * @param posY
     * @param table
     * @param editor
     */
    function moveCursorToCel(posX, posY, table, editor) {
      setTimeout(function () {
        let firstCell = new CKEDITOR.dom.element(table.$.children[0].rows[posX].cells[posY]);
        let range = editor.createRange();
        range.moveToPosition(firstCell, CKEDITOR.POSITION_AFTER_START);
        range.select();
      }, 0);
    }

  }

});
