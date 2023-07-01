CKEDITOR.plugins.add( 'websparkblockquote', {
  requires: 'widget',
  icons: 'websparkblockquote',
  init: function( editor ) {
    CKEDITOR.dialog.add( 'websparkblockquote', this.path + 'dialog/websparkblockquote.js' );

    // Add widget
    editor.ui.addButton('WebsparkBlockquote', {
      label: 'Blockquote',
      command: 'websparkblockquote',
      icon: this.path + 'icons/websparkblockquote.png'
    });

    editor.widgets.add( 'websparkblockquote', {
      dialog: 'websparkblockquote',
      button: 'Create a blockquote',

      template:
        '<div class="uds-blockquote accent-maroon">' +
					'<svg title="Open quote" role="presentation" viewBox="0 0 302.87 245.82">' +
					 '<path d="M113.61,245.82H0V164.56q0-49.34,8.69-77.83T40.84,35.58Q64.29,12.95,100.67,0l22.24,46.9q-34,11.33-48.72,31.54T58.63,132.21h55Zm180,0H180V164.56q0-49.74,8.7-78T221,35.58Q244.65,12.95,280.63,0l22.24,46.9q-34,11.33-48.72,31.54t-15.57,53.77h55Z"/>' +
					'</svg>' +
					'<blockquote>' +
					 '<p></p>' +
					 '<div class="citation">' +
					   '<cite class="name"></cite>' +
					   '<cite class="description"></cite>' +
					 '</div>' +
					'</blockquote>' +
        '</div>',


			upcast: function( element ) {
        return element.name == 'div' && element.hasClass( 'uds-blockquote' );
      },

			init: function() {
			var $el = jQuery(this.element.$);
			  this.data.content = jQuery('blockquote p', $el).text();
			  this.data.citation_name = jQuery('cite.name', $el).text();
			  this.data.citation_description = jQuery('cite.description', $el).text();
			},

      data: function() {
      var $el = jQuery(this.element.$);

        if (this.data.content) {
            jQuery('blockquote p', $el).text(this.data.content);
        }
        if (this.data.content) {
            jQuery('cite.name', $el).text(this.data.citation_name);
        }
        if (this.data.content) {
            jQuery('cite.description', $el).text(this.data.citation_description);
        }
      }
    } );
  }
} );

