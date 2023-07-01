# webspark_cropper_theme


Due to Layout Builder failing to load the  backend theme, the crop and media library fail to work correctly. The module, Media Library Theme Reset, fixes issues with the media library but causes issues further down the line with the cropper. It should not be used. This module makes use  of some functionality provided by the media library theme reset module but not all. Most functionality comes from the core Media modules themselves, although they may have been altered to add libraries. LIbraries added are direct copies of core seven/theme.

### Functions/Hooks

#### Template suggestions

A template suggestion is provided for the the cropper details tab - details--crop-wrapper

#### Media Form Alter

Adds back the seven media library libraries.

#### Preprocess views view fields media library

Adds a class to the view to provide a click to select mechanism.

#### Form Alter

Used to add classes/libraries. Webspark Cropper theme libraries are specifically added here. Adding them to the Layout BuilderForm itself produced random outcomes. Sometimes the libraries were available. Sometimes not.

#### Media Library Add Form Alter

Again used for adding libraries and classes, plus a missing string of text in the template.

#### Preprocess Links Media Library

Adds classes to the links in the left pane of the cropper.

#### Media Library Add Form Upload/OEEmbed form alter

Opportunity to add classes to these forms for styling.

#### Preprocess item list media library add form

Allows to add classes specifically for adding items to library.

#### Preprocess media library item small

This targets each pre-selected media item selected when adding new media in the modal media library dialog.

#### Preprocess fieldset media library widget

Adding classes to fieldset.

#### Theme Registry alter

A lot of heavy lifting here with templates. It is necessary to override the views templates and force it to use specific templates. Media specific templates are stored in the templates folder of this module.

#### Views Pre Render

Adds classes

#### Theme library info alter

Requirements for ASU involve modifying the core seven theme dialog.css. These are minor modifications to display the close button differently, for example. The css, dialog-overrides.css,
 is stored in the css folder of the module. If alterations are required to the dialog.css they should be made here for the backend theme.
