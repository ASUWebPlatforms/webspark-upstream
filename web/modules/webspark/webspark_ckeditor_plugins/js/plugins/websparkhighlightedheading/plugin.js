CKEDITOR.plugins.add('websparkhighlightedheading', {
    requires: 'widget',
    icons: 'websparkhighlightedheading',
    init: function (editor) {
        CKEDITOR.dialog.add('websparkhighlightedheading', this.path + 'dialog/websparkhighlightedheading.js');

        // Add widget
        editor.ui.addButton('WebsparkHighlightedHeading', {
            label: 'Highlighted Heading',
            command: 'websparkhighlightedheading',
            icon: this.path + 'icons/websparkhighlightedheading.png'
        });

        editor.widgets.add('websparkhighlightedheading', {
            dialog: 'websparkhighlightedheading',
            button: 'Create a Highlighted Heading',

            template: '<div class="uds-highlighted-heading"><h1>' + '<span class=""></span>' + '</h1></div>',

            upcast: function (element) {
                return element.name === 'div' && element.hasClass('uds-highlighted-heading');
            },

            init: function () {
                var $el = jQuery(this.element.$);
                
                // Get heading color
                if (jQuery('span', $el).hasClass("highlight-gold")) {
                  this.data.headingcolor = "highlight-gold";
                } else if (jQuery('span', $el).hasClass("highlight-black")) {
                  this.data.headingcolor = "highlight-black";
                } else if (jQuery('span', $el).hasClass("highlight-white")) {
                  this.data.headingcolor = "highlight-white";
                }
                // Get heading type
                this.data.headingtype = jQuery('h1,h2,h3,h4', $el).prop("tagName").toLowerCase();
                // Get text
                if (editor.getSelection()) {
                    this.data.content = editor.getSelection().getSelectedText();
                } else {
                    this.data.content = jQuery('span', $el).text();
                }
                
            },

            data: function () {
                var $el = jQuery(this.element.$);
                if (this.data.headingcolor) {
                  jQuery('span', $el).removeClass('highlight-gold highlight-black highlight-white').addClass(this.data.headingcolor);
                }
                
                if (this.data.headingtype) {
                    $el.html('<' + this.data.headingtype + '>' + jQuery('h1,h2,h3,h4', $el).html() + '</' + this.data.headingtype + '>' );
                }

                if (this.data.content) {
                    jQuery('span', $el).text(this.data.content);
                }
            }
        });
    }
});

