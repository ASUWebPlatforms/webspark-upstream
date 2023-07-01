(function () {
  CKEDITOR.dialog.add('websparkbutton', function (editor) {

    return {
      title: 'Button',
      minWidth: 500,
      minHeight: 150,
      resizable: false,
      contents: [
        {
          id: 'info',
          label: 'Info',
          accessKey: 'I',
          elements: [
            {
              type: "hbox",
              widths: ["50%", "50%"],
              children: [
                {
                  id: 'btntype',
                  type: 'select',
                  label: 'Style',
                  items: [
                    ['Button Gold', 'btn-gold'],
                    ['Button Maroon', 'btn-maroon'],
                    ['Button Gray 2', 'btn-gray'],
                    ['Button Gray 7', 'btn-dark'],
                  ],
                  setup: function (widget) {
                    this.setValue(widget.data.btntype || 'btn-gold');
                  },
                  commit: function (widget) {
                    widget.setData('btntype', this.getValue());
                  }
                },
                {
                  id: 'btnsize',
                  type: 'select',
                  label: 'Size',
                  items: [
                    ['Default', ''],
                    ['Medium', 'btn-md'],
                    ['Small', 'btn-sm'],
                  ],
                  setup: function (widget) {
                    this.setValue(widget.data.btnsize || '');
                  },
                  commit: function (widget) {
                    widget.setData('btnsize', this.getValue());
                  }
                }
              ]
            },
            {
              type: "hbox",
              widths: ["50%", "50%"],
              children: [
                {
                  id: 'text',
                  type: 'text',
                  width: '200px',
                  required: true,
                  label: 'Text',
                  setup: function (widget) {
                    this.setValue(widget.data.text || 'Button');
                  },
                  commit: function (widget) {
                    widget.setData('text', this.getValue());
                  }
                },
                {
                  id: 'href',
                  type: 'text',
                  width: '200px',
                  required: true,
                  label: 'URL',
                  setup: function (widget) {
                    this.setValue(widget.data.href || '#');
                  },
                  commit: function (widget) {
                    widget.setData('href', this.getValue());
                  }
                }
              ]
            }
          ]
        },
        {
          id: 'target',
          label: 'Target',
          elements: [
            {
              id: "target",
              type: "select",
              label: 'Target',
              items: [
                ['Not Set', ''],
                ['New Window (_blank)', "_blank"],
                ['Topmost Window (_top)', "_top"],
                ['Same Window (_self)', "_self"],
                ['Parent Window (_parent)', "_parent"]
              ],
              setup: function (widget) {
                this.setValue(widget.data.target || '');
              },
              commit: function (widget) {
                widget.setData('target', this.getValue());
              }
            }
          ]
        },
      ]
    };
  });
}());