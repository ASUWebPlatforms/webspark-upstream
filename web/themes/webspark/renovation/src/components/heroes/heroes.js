(function ($,Drupal) {

  'use strict';

  Drupal.behaviors.controlVideo = {
    attach: function (context) { 
 
      $('.uds-video-hero button', context)
        .once('videoButtonClickBehaviour')
        .each(function () {
          $(this).click(function () {
            var $video = $(this).closest('.uds-video-hero', context).find('video');

            if ($(this).hasClass('play')) {
              $video.get(0).play();
              $(this).hide();
              $(this).closest('.buttons', context).find('button.pause', context).show();
            }

            if ($(this).hasClass('pause')) {
              $video.get(0).pause();
              $(this).hide();
              $(this).closest('.buttons', context).find('button.play', context).show();
            }
          });
        });
    }
  };

})(jQuery, Drupal);
