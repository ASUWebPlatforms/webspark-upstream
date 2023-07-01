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

  CKEDITOR.plugins.add('websparkmediaalter', {
    requires: 'drupalmedialibrary',

    afterInit: function (editor) {
      editor.on('saveSnapshot', function (event) {
        document.querySelectorAll('iframe.cke_wysiwyg_frame').forEach((iframe) => {
          iframe.contentWindow.document.querySelectorAll('figure').forEach((fig) => {
            if (fig.querySelector('iframe')) {
              // Set the figure to 100% width.
              fig.style.width = '100%';

              // Make the caption as wide as the video.
              var caption = fig.querySelector(':scope > figcaption');
              if (caption) {
                caption.style.width = 'auto';
              }

              fig.querySelectorAll('.uds-video-container').forEach((div) => {
                if (div.querySelector('iframe')) {
                  div.style.marginBottom = '0';
                } else {
                  div.style.marginTop = '0';
                }
              });
            }
          });
        });
      });
    }
  });

})(CKEDITOR)
