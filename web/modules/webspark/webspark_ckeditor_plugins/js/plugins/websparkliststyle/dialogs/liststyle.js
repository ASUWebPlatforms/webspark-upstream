/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights
 *   reserved. For licensing, see LICENSE.md or
 *   https://ckeditor.com/legal/ckeditor-oss-license
 */

(function () {
  function getListElement(editor, listTag) {
    var range;
    try {
      range = editor.getSelection().getRanges()[0];
    }
    catch (e) {
      return null;
    }

    range.shrink(CKEDITOR.SHRINK_TEXT);
    return editor.elementPath(range.getCommonAncestor()).contains(listTag, 1);
  }

  var listItem = function (node) {
    return node.type == CKEDITOR.NODE_ELEMENT && node.is('li');
  };

  function listStyle(editor, startupPage) {
    if (startupPage == 'bulletedListStyle') {
      return {
        title: 'Bulleted List Properties',
        minWidth: 300,
        minHeight: 50,
        contents: [{
          id: 'info',
          accessKey: 'I',
          elements: [
            {
              type: 'select',
              label: 'Color',
              id: 'color',
              align: 'center',
              style: 'width:150px',
              items: [
                ['Default', 'default-list'],
                ['Maroon', 'maroon'],
                ['Gray 1', 'light-smokemode'],
                ['Gray 2', 'smokemode'],
                ['Gray 7', 'darkmode'],
                ['Gray 7 Gold Bullet', 'darkmode-gold'],
                ['Icon list', 'icn-default'],
                ['Icon list Maroon', 'icn-maroon'],
                ['Icon list Gray 7', 'icn-darkmode'],
                ['Icon list Gray 7 Gold', 'icn-darkmode-gold']
              ],
              setup: function (element) {
                this.setValue(getKeyClass(element));
              },
              commit: function (element) {
                // Get select value.
                var value = this.getValue();
                // Alert the user that they cannot theme lists within a list.
                if ( element.$.parentElement.nodeName === 'LI' ) {
                  editor.showNotification( 'Cannot apply more than one style to multi level list' );
                  return;
                }

                // Add class to be identified from.
                removeKeyClass(element);
                element.addClass("wp-" + value);

                if (value == '') {
                  value = 'default-list';
                }

                // If value starts with icn its a icon list.
                if (value.startsWith('icn')) {

                  // Alert the user that you cannot step list a multi level list.
                  var nested_ul = element.$.querySelectorAll("ul");
                  if (nested_ul.length > 0) {
                    editor.showNotification( 'Cannot apply style to multi level list' );
                    return;
                  }

                  // Add required classes for Icon list.
                  element.addClass('uds-list');
                  element.addClass('fa-ul');

                  if (value == 'icn-maroon') {
                    element.removeClass('darkmode');
                    element.removeClass('gold');
                    element.addClass('maroon')
                  }

                  if (value == 'icn-darkmode') {
                    element.addClass('darkmode');
                    element.removeClass('gold');
                    element.removeClass('maroon')
                  }

                  if (value == 'icn-darkmode-gold') {
                    element.addClass('darkmode');
                    element.addClass('gold');
                    element.removeClass('maroon')
                  }
                }

                // This is as standard bulleted list.
                else {
                  // Remove icon class.
                  element.removeClass('fa-ul')

                  if (element.hasClass('default-list') && value != 'default-list') {
                    element.removeClass('default-list');
                  }
                  if (element.hasClass('default-list') && value != 'default-list') {
                    element.removeClass('default-list');
                  }
                  if (element.hasClass('maroon') && value != 'maroon') {
                    element.removeClass('maroon');
                  }
                  if (element.hasClass('light-smokemode') && value != 'light-smokemode') {
                    element.removeClass('light-smokemode');
                  }
                  if (element.hasClass('smokemode') && value != 'smokemode') {
                    element.removeClass('smokemode');
                  }
                  if (element.hasClass('darkmode') && value != 'darkmode') {
                    element.removeClass('darkmode');
                  }
                  if (element.hasClass('darkmode') && element.hasClass('gold') && value != 'darkmode-gold') {
                    element.removeClass('darkmode');
                    element.removeClass('gold');
                  }
                  if (value == 'darkmode-gold') {
                    element.addClass('darkmode');
                    element.addClass('gold');
                  }
                  else {
                    element.addClass(value);
                  }
                }
                if (!element.hasClass('uds-list')) {
                  element.addClass('uds-list');
                }
              }
            }
          ],

        }],

        onShow: function () {
          var editor = this.getParentEditor(),
            element = getListElement(editor, 'ul');

          element && this.setupContent(element);
        },
        onOk: function () {
          var editor = this.getParentEditor(),
            element = getListElement(editor, 'ul');

          element && this.commitContent(element);
        }
      };
    }
    else if (startupPage == 'numberedListStyle') {

      return {
        title: 'Numbered List Properties',
        minWidth: 300,
        minHeight: 50,
        contents: [{
          id: 'info',
          accessKey: 'I',
          elements: [{
            type: 'hbox',
            widths: ['25%', '75%'],
            children: [
              {
                type: 'select',
                label: 'Color',
                id: 'color',
                align: 'center',
                style: 'width:150px',
                items: [
                  ['Default', 'default-list'],
                  ['Maroon', 'maroon'],
                  ['Gray 1', 'light-smokemode'],
                  ['Gray 2', 'smokemode'],
                  ['Gray 7', 'darkmode'],
                  ['Gray 7 Gold', 'darkmode-gold'],
                  ['Step List Default', 'stp-default'],
                  ['Step List Gold Counter', 'stp-gold-counter'],
                  ['Step List Maroon Counter', 'stp-maroon-counter'],
                  ['Step List Gray 2', 'stp-smokemode'],
                  ['Step List Gray 2 Gold Counter', 'stp-smokemode-gold'],
                  ['Step List Gray 2 Maroon Counter', 'stp-smokemode-maroon'],
                  ['Step List Gray 1', 'stp-lightsmokemode'],
                  ['Step List Gray 1 Gold Counter', 'stp-lightsmokemode-gold'],
                  ['Step List Gray 1 Maroon Counter', 'stp-lightsmokemode-maroon'],
                  ['Step List Gray 7', 'stp-darkmode'],
                  ['Step List Gray 7 Gold Counter', 'stp-darkmode-gold']
                ],
                setup: function (element) {
                  this.setValue(getKeyClass(element));
                },
                commit: function (element) {
                  // Get select value.
                  var value = this.getValue();

                  // Alert the user that they cannot theme lists within a list.
                  if ( element.$.parentElement.nodeName === 'LI' ) {
                    editor.showNotification( 'Cannot apply more than one style to multi level list' );
                    return;
                  }

                  if (value == '') {
                    value = 'default-list';
                  }

                  // Add class to be identified from.
                  removeKeyClass(element);
                  element.addClass("wp-" + value);

                  // If value starts with stp its a step value.
                  if (value.startsWith('stp')) {

                    // Alert the user that you cannot step list a multi level list.
                    var nested_ol = element.$.querySelectorAll("ol");
                    if (nested_ol.length > 0) {
                      editor.showNotification( 'Cannot apply style to multi level list' );
                      return;
                    }

                    // Add required classes for steplist.
                    element.addClass('uds-list');
                    element.addClass('uds-steplist');

                    // Remove NLR clases.
                    if (value == 'stp-default') {
                      // Remove NLR classes.
                      element.removeClass('uds-steplist-gold');
                      element.removeClass('uds-steplist-maroon');
                      element.removeClass('smokemode');
                      element.removeClass('light-smokemode');
                      element.removeClass('darkmode');
                      element.removeClass('maroon');
                    }
                    // Default gold.
                    if (value == 'stp-gold-counter') {
                      // Remove NLR classes.
                      element.removeClass('uds-steplist-maroon');
                      element.removeClass('smokemode');
                      element.removeClass('light-smokemode');
                      element.removeClass('darkmode');

                      // Add classes.
                      element.addClass('uds-steplist-gold');
                    }
                    // Default maroon.
                    if (value == 'stp-maroon-counter') {
                      // Remove NLR classes.
                      element.removeClass('uds-steplist-gold');
                      element.removeClass('smokemode');
                      element.removeClass('light-smokemode');
                      element.removeClass('darkmode');

                      // Add classes.
                      element.addClass('uds-steplist-maroon');
                    }
                    // Smoke mode.
                    if (value == 'stp-smokemode') {
                      // Remove NLR classes.
                      element.removeClass('uds-steplist-gold');
                      element.removeClass('uds-steplist-maroon');
                      element.removeClass('light-smokemode');
                      element.removeClass('darkmode');

                      // Add classes.
                      element.addClass('smokemode');
                    }
                    // Smoke mode gold.
                    if (value == 'stp-smokemode-gold') {
                      // Remove NLR classes.
                      element.removeClass('uds-steplist-maroon');
                      element.removeClass('light-smokemode');
                      element.removeClass('darkmode');

                      // Add classes.
                      element.addClass('smokemode');
                      element.addClass('uds-steplist-gold');
                    }
                    // Smoke mode maroon.
                    if (value == 'stp-smokemode-maroon') {
                      // Remove NLR classes.
                      element.removeClass('uds-steplist-maroon');
                      element.removeClass('light-smokemode');
                      element.removeClass('darkmode');

                      // Add classes.
                      element.addClass('smokemode');
                      element.addClass('uds-steplist-maroon');
                    }
                    // Light Smoke mode.
                    if (value == 'stp-lightsmokemode') {
                      // Remove NLR classes.
                      element.removeClass('uds-steplist-gold');
                      element.removeClass('uds-steplist-maroon');
                      element.removeClass('smokemode');
                      element.removeClass('darkmode');

                      // Add classes.
                      element.addClass('light-smokemode');
                    }
                    // Light Smoke mode gold.
                    if (value == 'stp-lightsmokemode-gold') {
                      // Remove NLR classes.
                      element.removeClass('uds-steplist-maroon');
                      element.removeClass('smokemode');
                      element.removeClass('darkmode');

                      // Add classes.
                      element.addClass('light-smokemode');
                      element.addClass('uds-steplist-gold');
                    }
                    // Light Smoke mode maroon.
                    if (value == 'stp-lightsmokemode-maroon') {
                      // Remove NLR classes.
                      element.removeClass('uds-steplist-gold');
                      element.removeClass('smokemode');
                      element.removeClass('darkmode');

                      // Add classes.
                      element.addClass('light-smokemode');
                      element.addClass('uds-steplist-maroon');
                    }
                    // Darkmode.
                    if (value == 'stp-darkmode') {
                      // Remove NLR classes.
                      element.removeClass('uds-steplist-gold');
                      element.removeClass('uds-steplist-maroon');
                      element.removeClass('smokemode');
                      element.removeClass('light-smokemode');

                      // Add classes.
                      element.addClass('darkmode');
                    }
                    // Darkmode gold.
                    if (value == 'stp-darkmode-gold') {
                      // Remove NLR classes.
                      element.removeClass('uds-steplist-maroon');
                      element.removeClass('smokemode');
                      element.removeClass('light-smokemode');

                      // Add classes.
                      element.addClass('darkmode');
                      element.addClass('uds-steplist-gold');
                    }
                  }

                  else {
                    // Remove step list elements.
                    element.removeClass('uds-steplist');
                    element.removeClass('uds-steplist-maroon');
                    element.removeClass('uds-steplist-gold');

                    // Add class after removing existing class.
                    if (value) {
                      // Ensure the step list class is not applied.
                      element.removeClass('uds-steplist');
                      // Add remove classes as required.
                      if (element.hasClass('default-list') && value != 'default-list') {
                        element.removeClass('default-list');
                      }
                      if (element.hasClass('maroon') && value != 'maroon') {
                        element.removeClass('maroon');
                      }
                      if (element.hasClass('light-smokemode') && value != 'light-smokemode') {
                        element.removeClass('light-smokemode');
                      }
                      if (element.hasClass('smokemode') && value != 'smokemode') {
                        element.removeClass('smokemode');
                      }
                      if (element.hasClass('darkmode') && value != 'darkmode') {
                        element.removeClass('darkmode');
                      }
                      if (element.hasClass('darkmode') && element.hasClass('gold') && value != 'darkmode-gold') {
                        element.removeClass('darkmode');
                        element.removeClass('gold');
                      }
                      if (value == 'darkmode-gold') {
                        element.addClass('darkmode');
                        element.addClass('gold');
                      }
                      else {
                        element.addClass(value);
                      }
                    }
                    // Apply uds-list class if element does not have it.
                    if (!element.hasClass('uds-list')) {
                      element.addClass('uds-list');
                    }
                  }
                }
              }]
          }]
        }],
        onShow: function () {
          var editor = this.getParentEditor(),
            element = getListElement(editor, 'ol');

          element && this.setupContent(element);
        },
        onOk: function () {
          var editor = this.getParentEditor(),
            element = getListElement(editor, 'ol');

          element && this.commitContent(element);
        }
      };
    }
  }

  function getKeyClass(element) {
    var classList = element.$.className.split(' ');
    var defaultValue = 'default-list';
    classList.forEach(function(className) {
      if (className.startsWith("wp-")) {
        defaultValue = className.substring(3);
      }
    });
    return defaultValue;
  }

  function removeKeyClass(element) {
    var classList = element.$.className.split(' ');
    classList.forEach(function(className) {
      if (className.startsWith("wp-")) {
        element.removeClass(className);
      }
    });
  }

  CKEDITOR.dialog.add('numberedListStyle', function (editor) {
    return listStyle(editor, 'numberedListStyle');
  });

  CKEDITOR.dialog.add('bulletedListStyle', function (editor) {
    return listStyle(editor, 'bulletedListStyle');
  });
})();
