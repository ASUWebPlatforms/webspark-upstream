CKEDITOR.dialog.add('websparktable', function (editor) {
  let dialog;
  let table;

  /**
   * Stores the dialog user input into an accessible
   * scope to allow access to the rest of the plugin.
   *
   * @param data
   */
  let commitValue = function (data) {
    let id = this.id;

    if (!data.info) {
      data.info = {};
    }

    data.info[id] = this.getValue();
  };

  // Dialog.
  return {
    title: "Add table",
    minWidth: 360,
    minHeight: 320,

    onLoad: function () {
      dialog = this;
      this.setupContent();
    },

    /**
     * @todo remove this method.
     */
    onShow: function () {
    },

    /**
     * When confirm the dialog.
     */
    onOk: function () {
      let data = {};
      this.commitContent(data);
      table = buildTable(data.info);
      editor.insertElement(table);
    },

    contents: [
      {
        id: 'tab1',
        label: '',
        title: '',
        expand: true,
        padding: 0,
        elements: [
          {
            type: 'text',
            id: 'txtRows',
            'default': 3,
            label: "Rows",
            required: true,
            setup: function (selectedElement) {
              // this.setValue(selectedElement.$.rows.length);
            },
            commit: commitValue
          }, {
            type: 'text',
            id: 'txtCols',
            'default': 2,
            label: "Columns",
            required: true,
            setup: function (selectedTable) {
              // this.setValue(tableColumns(selectedTable));
            },
            commit: commitValue
          },
          {
            id: 'headers',
            type: 'select',
            label: 'Headers',
            items: [
              [ 'None', 'none' ],
              [ 'First row', 'row' ],
              [ 'First column', 'column' ],
              [ 'Both', 'both' ]
            ],
            setup: function( element ) {
              this.setValue('none');
            },
            commit: commitValue
          },
          {
            id: 'type',
            type: 'select',
            label: 'Table Type',
            items: [
              [ 'Default', 'default' ],
              [ 'Fixed', 'fixed' ]
            ],
            setup: function( element ) {
              this.setValue('default');
            },
            commit: commitValue
          },
          {
            type: 'text',
            id: 'txtCaption',
            label: 'Caption',
            required: false,
            setup: function (selectedTable) {
              // this.setValue(tableColumns(selectedTable));
            },
            commit: commitValue
          },
        ]
      }
    ],
    buttons: [CKEDITOR.dialog.okButton]
  };



  /**
   * Generates the DOM table.
   *
   * @param {Object} data
   *
   * @return {CKEDITOR.dom.element}
   */
  function buildTable(data) {
    let rows = parseInt(data.txtRows, 10) || 1;
    let cols = parseInt(data.txtCols, 10) || 1;
    let headers = data.headers;
    let caption = data.txtCaption || '';

    let wrapper = new CKEDITOR.dom.element("div");
    wrapper.addClass('uds-table');
    if (data.type === 'fixed') {
      wrapper.addClass('uds-table-fixed');
    }

    let table = new CKEDITOR.dom.element("table");
    table.addClass('cke_show_border');

    if (caption) {
      let captionEl = new CKEDITOR.dom.element('caption');
      captionEl.appendText(caption);
      table.append(captionEl);
    }

    let body = new CKEDITOR.dom.element("tbody");
    let header = new CKEDITOR.dom.element("thead");

    for (let i = 0; i < rows; i++) {
      let $row = new CKEDITOR.dom.element("tr");

      for (let j = 0; j < cols; j++) {
        let $col = {};
        if ((headers === 'row' && i === 0) || (headers === 'column' && j === 0) || (headers === 'both' && (i === 0 || j === 0))) {
          $col = new CKEDITOR.dom.element("th");
        }
        else {
          $col = new CKEDITOR.dom.element("td");
        }
        $row.append($col);
      }

      if (i === 0 && (headers === 'row' || headers === 'both')) {
        header.append($row);
        table.append(header);
      }
      else {
        body.append($row);
      }

    }
    table.append(body);

    wrapper.append(table);

    return wrapper;
  }



});