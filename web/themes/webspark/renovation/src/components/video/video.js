(function ($, Drupal) {

  'use strict';
  
  Drupal.behaviors.resizeRemoteVideoCaption = {
    attach: function (context) {
      document.querySelectorAll('figure').forEach((fig) => {
        if (fig.querySelector('iframe')) {
          // Set the figure to 100% width.
          fig.style.width ='100%';
          
          // Make the caption as wide as the video.
          var caption = fig.querySelector(':scope > figcaption');
          if (caption) {
            var newHTML = '<div class="uds-video-container">' + caption.outerHTML + '</div>';
            caption.outerHTML = newHTML;
          }
          
          fig.querySelectorAll('.uds-video-container').forEach((div) => {
            if (div.querySelector('iframe')) {
              div.style.marginBottom = '0';
//              div.style.borderBottom = 'none';
            }
            else {
              div.style.marginTop = '0';
            }
          });
        }
      });
    }
  };

})(jQuery, Drupal);
