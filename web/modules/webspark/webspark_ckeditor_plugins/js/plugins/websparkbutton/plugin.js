CKEDITOR.plugins.add('websparkbutton', {
  requires: 'widget,dialog',
  icons: 'websparkbutton',
  init: function (editor) {
    // Allow any attributes.
    editor.config.extraAllowedContent = '*(*);*{*}';
    CKEDITOR.dialog.add('websparkbutton', this.path + 'dialog/websparkbutton.js');

    // Add widget
    editor.ui.addButton('WebsparkButton', {
        label: 'Button',
        command: 'websparkbutton',
        icon: this.path + 'icons/websparkbutton.png'
    });

    editor.widgets.add('websparkbutton', {
        dialog: 'websparkbutton',

          init: function () {
            var $el = jQuery(this.element.$);

            //Color
            if ($el.hasClass("btn-gold")) {
              this.data.btntype = "btn-gold";
            } else if ($el.hasClass("btn-maroon")) {
              this.data.btntype = "btn-maroon";
            } else if ($el.hasClass("btn-gray")) {
              this.data.btntype = "btn-gray";
            } else if ($el.hasClass("btn-dark")) {
              this.data.btntype = "btn-dark";
            }
            //Size.
            if ($el.hasClass("btn-md")) {
              this.data.btnsize = "btn-md";
            } else if ($el.hasClass("btn-sm")) {
              this.data.btnsize = "btn-sm";
            }

            this.data.href = $el.attr('href');

            this.data.target = $el.attr('target');

            this.data.text = jQuery('.text', $el).text();

          },

          template: '<a class="btn" role="button">' + '<span class="text"></span>' + '</a>',

          data: function () {
            var $el = jQuery(this.element.$);

            if (this.data.btntype) {
              $el.removeClass('btn-gold btn-maroon btn-gray btn-dark').addClass(this.data.btntype);
            }

            $el.removeClass('btn-md btn-sm ');
            if (this.data.btnsize) {
              $el.addClass(this.data.btnsize);
            }

            if (this.data.href) {
              $el.attr('href', this.data.href);
              this.element.$.removeAttribute('data-cke-saved-href');
            }

            if (this.data.target && this.data.target != '') {
                $el.attr('target', this.data.target);
            }

            if (this.data.text) {
                jQuery('.text', $el).text(this.data.text);
            }

          },

          requiredContent: 'a(btn)',

          upcast: function (element) {
            return element.name == 'a' && element.hasClass('btn');
          }
      });
    }
});
