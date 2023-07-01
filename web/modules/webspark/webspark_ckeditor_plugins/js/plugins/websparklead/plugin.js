CKEDITOR.plugins.add( 'websparklead', {
  requires: 'widget',
  icons: 'websparklead',
  init: function( editor ) {
    CKEDITOR.dialog.add( 'websparklead', this.path + 'dialog/websparklead.js' );

    // Add widget
    editor.ui.addButton('WebsparkLead', {
      label: 'Lead',
      command: 'websparklead',
      icon: this.path + 'icons/websparklead.png'
    });

     editor.addCommand( 'websparklead', {
      exec : function( editor ) {
        if (editor.getSelection().getStartElement().hasClass('lead')) {
          editor.getSelection().getStartElement().removeClass('lead');
        }
        else {
          var selected_text = editor.getSelection().getSelectedText();
          var newElement = new CKEDITOR.dom.element("p");
          newElement.addClass('lead');
          newElement.setText(selected_text);
          editor.insertElement(newElement);
        }

      }
    });
  }
});
