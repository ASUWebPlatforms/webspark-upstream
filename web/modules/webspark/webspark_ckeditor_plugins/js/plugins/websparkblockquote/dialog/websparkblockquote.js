CKEDITOR.dialog.add( 'websparkblockquote', function( editor ) {
  return {
    title: 'Edit Blockquote',
    minWidth: 800,
    minHeight: 200,
    contents: [
      {
	      id: 'info',
	      elements: [
          {
            id: 'content',
            type: 'textarea',
            label: 'Content',
            width: '500px',
            setup: function( widget ) {
              this.setValue( widget.data.content );
            },
            commit: function( widget ) {
              widget.setData( 'content', this.getValue() );
            }
	        },
          {
            id: 'citation_name',
            type: 'text',
            label: 'Citation Name',
            width: '500px',
            setup: function( widget ) {
              this.setValue( widget.data.citation_name );
            },
            commit: function( widget ) {
              widget.setData( 'citation_name', this.getValue() );
            }
          },
          {
            id: 'citation_description',
            type: 'text',
            label: 'Citation Description',
            width: '500px',
            setup: function( widget ) {
              this.setValue( widget.data.citation_description );
            },
            commit: function( widget ) {
              widget.setData( 'citation_description', this.getValue() );
            }
          },
        ]
      }
    ]
  };
} );