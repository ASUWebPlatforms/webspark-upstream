CKEDITOR.dialog.add('websparkhighlightedheading', function (editor) {
    return {
        title: 'Edit Heading',
        minWidth: 800,
        minHeight: 200,
        contents: [
            {
                id: 'info',
                elements: [
                    {
                        type: "hbox",
                        widths: ["50%", "50%"],
                        children: [
                            {
                                id: 'content',
                                type: 'textarea',
                                label: 'Content',
                                width: '500px',
                                setup: function (widget) {
                                    this.setValue(widget.data.content);
                                },
                                commit: function (widget) {
                                    widget.setData('content', this.getValue());
                                }
                            }
                        ]
                    },
                    {
                        type: "hbox",
                        widths: ["50%", "50%"],
                        children: [
                            {
                                id: 'headingcolor',
                                type: 'select',
                                label: 'Style',
                                items: [
                                    ['Gold Highlight', 'highlight-gold'],
                                    ['Gray 7 Highlight', 'highlight-black'],
                                    ['White Highlight', 'highlight-white'],
                                ],
                                setup: function (widget) {
                                    this.setValue(widget.data.headingcolor || 'highlight-gold');
                                },
                                commit: function (widget) {
                                    widget.setData('headingcolor', this.getValue());
                                }
                            },
                            {
                                id: 'headingtype',
                                type: 'select',
                                label: 'Heading',
                                items: [
                                    ['H1', 'h1'],
                                    ['H2', 'h2'],
                                    ['H3', 'h3'],
                                    ['H4', 'h4'],
                                ],
                                setup: function (widget) {
                                    this.setValue(widget.data.headingtype || 'h1');
                                },
                                commit: function (widget) {
                                    widget.setData('headingtype', this.getValue());
                                }
                            }
                        ]
                    },
                ]
            }
        ]
    };
});
