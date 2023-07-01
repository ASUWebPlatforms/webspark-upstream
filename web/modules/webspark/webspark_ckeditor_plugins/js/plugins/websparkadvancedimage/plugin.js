/**
 * @file
 * Drupal Advanced Image plugin.
 *
 * This alters the existing CKEditor image2 widget plugin, which is already
 * altered by the Drupal Image plugin, to:
 * - allow for the title, class & id attributes to be set
 * - mimic the upcasting behavior of the caption_filter filter.
 *
 * @ignore
 */

/* global CKEDITOR */

(function (CKEDITOR) {
  'use strict'

  CKEDITOR.plugins.add('websparkadvancedimage', {
    requires: 'drupalimage',

    beforeInit: function (editor) {
      // Add CSS file.
      editor.addContentsCss(this.path + 'css/ckeditor.websparkadvancedimage.css')

      // Override the image2 widget definition to handle the additional
      // title, class and id attributes.
      editor.on('widgetDefinition', function (event) {
        var widgetDefinition = event.data
        if (widgetDefinition.name !== 'image') {
          return
        }

        // Protected; keys of the widget data to be sent to the Drupal dialog.
        // Append to the values defined by the drupalimage plugin.
        // @see core/modules/ckeditor/js/plugins/drupalimage/plugin.js
        CKEDITOR.tools.extend(widgetDefinition._mapDataToDialog, {
          'round': 'round',
          'spacing_top': 'spacing_top',
          'spacing_bottom': 'spacing_bottom',
          'spacing_left': 'spacing_left',
          'spacing_right': 'spacing_right',
        })

        // Override downcast(): since we only accept <img> in our upcast method,
        // the element is already correct. We only need to update the element's
        // title attribute.
        var originalDowncast = widgetDefinition.downcast
        widgetDefinition.downcast = function (element) {
          
          var img = findElementByName(element, 'img')
          originalDowncast.call(this, img)
          
          img.attributes['class'] = 'img-fluid';
          
          // Spacing
          var directions = ['top', 'bottom', 'left', 'right'];
          var direction;

          for (direction of directions) {
            var pattern = new RegExp('spacing-' + direction + '-\\d+');
            
            if (this.data['spacing_' + direction]) {
              var toBeReplaced = '';

              if (img.attributes['class'].indexOf('spacing-' + direction) !== -1) {
                toBeReplaced = img.attributes['class'].match(pattern)[0];
              }
              var replaceWith = this.data['spacing_' + direction] !== 'none' ? this.data['spacing_' + direction] : '';

              img.attributes['class'] = toBeReplaced ? img.attributes['class'].replace(toBeReplaced, replaceWith) : img.attributes['class'] + ' ' + replaceWith;
            }
          }
          
          if (this.data['round']) {
            
            if (img.attributes['class'].indexOf('rounded-circle') == -1) {
              img.attributes['class'] = img.attributes['class'] + ' ' + 'rounded-circle';
              
            }
          }
          else {
            if (img.attributes['class'].indexOf('rounded-circle') !== -1) {
              img.attributes['class'] = img.attributes['class'].replace('rounded-circle', '')
            }
          }

          return img
        }

        // We want to upcast <img> elements to a DOM structure required by the
        // image2 widget; we only accept an <img> tag, and that <img> tag MAY
        // have a data-entity-type and a data-entity-uuid attribute.
        var originalUpcast = widgetDefinition.upcast
        widgetDefinition.upcast = function (element, data) {
          if (element.name !== 'img') {
            return
          // Don't initialize on pasted fake objects.
          } else if (element.attributes['data-cke-realelement']) {
            return
          }

          element = originalUpcast.call(this, element, data)

          // Check the originalUpcast detect an <img> element.
          if (typeof element === 'undefined') {
            return
          }

          // Apply attributes on <figure> when dealing with captioned images.
          var el = element
          if (el.name === 'figure') {
            el = el.children[0]
          }
          
          // Spacing
          var directions = ['top', 'bottom', 'left', 'right'];
          var direction;

          for (direction of directions) {
            var pattern = new RegExp('spacing-' + direction + '-\\d+');

            if (el.attributes['class'] && el.attributes['class'].indexOf('spacing-' + direction) !== -1) {
              var className = el.attributes['class'].match(pattern);
              data['spacing_' + direction] = className[0];
            }
            else {
              data['spacing_' + direction] = 'none';
            }
          }
          
          // Round image
          if (el.attributes['class'] && el.attributes['class'].indexOf('rounded-circle') !== -1) {
            data['round'] = '1';
          }
          else {
            data['round'] = '';
          }

          return element
        }

        // Low priority to ensure drupalimage's event handler runs first.
      }, null, null, 20)
    }
  })

  /**
   * Finds an element by its name.
   *
   * Function will check first the passed element itself and then all its
   * children in DFS order.
   *
   * @param {CKEDITOR.htmlParser.element} element
   *   The element to search.
   * @param {string} name
   *   The element name to search for.
   *
   * @return {?CKEDITOR.htmlParser.element}
   *   The found element, or null.
   */
  function findElementByName (element, name) {
    if (element.name === name) {
      return element
    }

    var found = null
    element.forEach(function (el) {
      if (el.name === name) {
        found = el
        // Stop here.
        return false
      }
    }, CKEDITOR.NODE_ELEMENT)
    return found
  }
})(CKEDITOR)
