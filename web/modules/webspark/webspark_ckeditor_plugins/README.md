



# Webspark ckeditor plugins module

## Description

Webspark ckeditor plugins module comes with a number of plugins for the ckeditor that
add or alter the functionalities of the rich text editor when creating new
content.

## Plugins

### 1. WebsparkAdvancedImage
#### 1.1 Description
This alters the existing CKEditor image2 widget plugin, which is already altered by the Drupal Image plugin.
#### 1.2. Functionalities
- Allow for the image margins to be set
- Allow for rounded-corners to be applied to the image
#### 1.3. How to use
When the user inserts a new image in the CKEditor, there are several options available for the margins in the form of drop-down lists for setting margins on the image.
In the Extra section we have an option (checkbox) to make the image round

### 2. WebsparkBlockQuote
#### 2.1 . Description
Adds an icon to the ckeditor that creates a webspark block quote.
#### 2.2. Functionalities
- Webspark block quote adds a template for a quote. The template contains a div with uds-blockquote class, font awesome specific quotation icons and citation specific tags.
- Add the content, name and description for the quote.
- Edit the content, name and desription for an existing qoute.
- #### 2.3. How to use
The icon has to added in the toolbar. Check this in the /admin/config/content/formats
When clicking on the icon, the quote popup will prompt. By summiting the popup, the structure will be generated in the text editor. You can edit and existing one by selecting the quote in text editor and click on the icon.

### 3. WebsparkButton

#### 3.1 . Description
Adds an icon to the ckeditor that creates a webspark button.

#### 3.2. Functionalities
- The webspark button is a span tag inside a \<a\> tag with a class "btn".
- You can choose the style of the button
- It also has the context menu for changing the styles.

#### 3.3. How to use
The icon has to added in the toolbar. Check this in the  /admin/config/content/formats
Add the button from the toolbar, fill the fields and save.
Right click to change the options.

### 4. WebsparkDivider
#### 4.1 . Description
Adds an icon to the ckeditor that creates a webspark divider.
#### 4.2. Functionality
Adds a hr tag with a class "copy-divider".
#### 4.3. How to use
The icon has to added in the toolbar. Check this in the /admin/config/content/formats
Click on the button to add the divider.

### 5. WebsparkHighlightedHeading
#### 5.1 . Description
Adds an icon to the CKEditor that inserts a Highlighted Heading.
#### 5.2 . Functionalities
- Allows headings (H1, H2, H3, H4) to be created.
- Allows highlight to be applied to the headings (Gold, Grey 7, White)
#### 5.3 . How to use
A highlighted heading can be inserted using the icon in the toolbar. When clicked, the text, color and heading type options will be available to be set. In order to edit an existing one, one needs to double-click the text inside the editor.
### 6. WebsparkLead
#### 6.1 . Description
Adds an icon to the CKEditor that adds a Lead element.
#### 6.2 . Functionalities
- Adds a paragraph with the class "lead".
#### 6.3 . How to use
A lead element can be added by first selecting the text inside the editor and then press the lead icon in the toolbar.
### 7. WebsparkListStyle

#### 7.1 Description

This plugin alters the functionality of the ordered and unordered lists.

#### 7.2 Functionalities

- Adds the required classes for the ASU
- Adds a context menu to be able to change the style
- On SHIFT+ENTER a "list item description" in the form of "\<span\>" is generated

#### 7.2 How to use

Once the module is installed and the unordered list or ordered list icons are
on the ckeditor toolbar, the plugin modifications appear when you click on these
icons or if you right click on an existing list inside the ckeditor.

#### 7.3 How to create icon list
To create an icon list
- Create an unordered list.
- Right click on the list and select one of the Icon List options
- Click on the begining of the list item
- Click on the icon named "Font Awesome" (the flag shaped) and choose the icon

### 8. WebsparkMediaAlter
#### 8.1 Description
This plugin adds extra styles to the remote video media by executing a JS script.
#### 8.2 Functionalities
Applies styles to the remote video by executing a script on "saveSnapshot" event.
### 9. WebsparkTable

#### 9.1 Description

The webspark table plugin replaces the default table that comes with the
ckeditor to match webspark needs.

#### 9.2 Functionalities

- Adds the required classes on the table and inside the table for the ASU
- Adds the option to change those classes on the context menu

#### 9.2 How to use

The new icon needs to be added in the specific format :
/admin/config/content/formats
If the icon is added, you can click on it in the ckeditor. Another way to
interact with the plugin is through the context menu, by right-clicking on
an existing table inside the text editor.

#### 9.3 Difficulties

There was no way to alter the default table, so the current plugin copies a lot
from the ckeditor table code.

## Additional info

These plugins are built on the ckeditor version 4.

## Requirements

Drupal 8.x. or Drupal 9.x
