CKEDITOR.plugins.add( 'websparkdivider', {
  icons: 'websparkdivider',
  init: function( editor ) {
    editor.addCommand( 'insertDivider', {
      exec: function( editor ) {
        var element = new CKEDITOR.dom.element( 'hr' );
        editor.insertHtml('<hr class="copy-divider" />' );
      }
    });
    editor.ui.addButton( 'WebsparkDivider', {
      label: 'Divider',
      command: 'insertDivider',
      icon: this.path + 'icons/websparkdivider.png'
    });
   }
});