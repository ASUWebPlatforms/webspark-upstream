( function() {
  CKEDITOR.plugins.liststyle = {
    requires: 'dialog,contextmenu',
    init: function( editor ) {
      if ( editor.blockless )
        return;

      var def, cmd;

      def = new CKEDITOR.dialogCommand( 'numberedListStyle', {
        requiredContent: 'ol',
        allowedContent: 'ol',
      } );
      cmd = editor.addCommand( 'numberedListStyle', def );
      editor.addFeature( cmd );
      CKEDITOR.dialog.add( 'numberedListStyle', this.path + 'dialogs/liststyle.js' );

      def = new CKEDITOR.dialogCommand( 'bulletedListStyle', {
        requiredContent: 'ul',
        allowedContent: 'ul',
      } );
      cmd = editor.addCommand( 'bulletedListStyle', def );
      editor.addFeature( cmd );
      CKEDITOR.dialog.add( 'bulletedListStyle', this.path + 'dialogs/liststyle.js' );

      //Register map group;
      editor.addMenuGroup( 'list', 108 );

      editor.addMenuItems( {
        numberedlist: {
          label: 'Numbered List Properties',
          group: 'list',
          command: 'numberedListStyle'
        },
        bulletedlist: {
          label: 'Bulleted List Properties',
          group: 'list',
          command: 'bulletedListStyle'
        }
      } );

      editor.contextMenu.addListener( function( element ) {
        if ( !element || element.isReadOnly() )
          return null;

        while ( element ) {
          var name = element.getName();
          if ( name == 'ol' )
            return { numberedlist: CKEDITOR.TRISTATE_OFF };
          else if ( name == 'ul' )
            return { bulletedlist: CKEDITOR.TRISTATE_OFF };

          element = element.getParent();
        }
        return null;
      } );


      editor.on('key', function (event) {
        // Change the SHIFT+ENTER default ckeditor behaviour.
        if (event.data.keyCode == 2228237) {
          var selection = this.getSelection();
          var element = selection.getStartElement();
          var list = element.getParent();
          var ranges = selection.getRanges();
          // Check if nothing else is selected and the this is an element
          // from the stepped list.
          if (ranges[0].collapsed && list.hasClass('uds-steplist')) {
            // Add the default SHIF+ENTER behaviour.
            let br = new CKEDITOR.dom.element("br");
            editor.insertElement(br);
            // Add a span if the span is not there
            let span = new CKEDITOR.dom.element("span");
            // Add the Bogus , otherwise the caret will no go inside.
            span.appendBogus();
            editor.insertElement(span);
            let range = editor.createRange();
            // Move caret inside span.
            range.moveToPosition(span, CKEDITOR.POSITION_AFTER_START);
            range.select();
            return false;
          }

         }
      });


      // The first time we create list we need to add the uds-list class on them.
      CKEDITOR.on( 'instanceReady', function( evt ) {
        evt.editor.on( 'afterCommandExec', function ( event ) {
          if( event.data.name == 'bulletedlist' || event.data.name == 'numberedlist' ) {
            var s = evt.editor.getSelection();
            var list = s.getStartElement().getParent();
            var element_name = list.getName();
            if (element_name === 'ol' ||  element_name === 'ul') {
              list.addClass('uds-list');
            }
          }
        })
      });
    },
  };

  CKEDITOR.plugins.add( 'liststyle', CKEDITOR.plugins.liststyle );
} )();
