/**
 * @file This is what CKEditor refers to as a master (glue) plugin. Its role is
 * just to load the “editing” and “UI” components of this Plugin. Those
 * components could be included in this file, but
 *
 * I.e, this file's purpose is to integrate all the separate parts of the plugin
 * before it's made discoverable via index.js.
 */

import {Plugin} from "ckeditor5/src/core";
import WebsparkMediaAlterCommand from "./websparkmediaaltercommand";

export default class WebsparkMediaAlterEditing extends Plugin {

    /**
     * @inheritdoc
     */
    static get pluginName() {
        return 'WebsparkMediaAlterEditing';
    }

    constructor(editor) {
        super(editor);

        this.attrs = {
            dataInlineStyle: 'data-inline-style',
        };
        this.converterAttributes = [
            'dataInlineStyle',
        ];
    }

    init() {
        const schema = this.editor.model.schema;
        const conversion = this.editor.conversion;

        if (schema.isRegistered('drupalMedia')) {
            schema.extend('drupalMedia', {
                allowAttributes: ['dataInlineStyle']
            });
        }

        // Set attributeToAttribute conversion for all supported attributes.
        Object.keys(this.attrs).forEach((modelKey) => {
            const attributeMapping = {
                model: {
                    key: modelKey,
                    name: 'drupalMedia',
                },
                view: {
                    key: 'style',
                    value: {
                        width: '100%',
                        'max-width': '100%'
                    }
                },
            };
            conversion.for('upcast').attributeToAttribute(attributeMapping);
            conversion.for('downcast').attributeToAttribute(attributeMapping);
        });
        this.editor.commands.add(
            'addInlineStyle', new WebsparkMediaAlterCommand( this.editor )
        );

    }

}
