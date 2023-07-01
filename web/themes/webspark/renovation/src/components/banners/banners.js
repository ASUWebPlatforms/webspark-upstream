(function ($,Drupal) {

  'use strict';

  Drupal.behaviors.closeBanner = {
    attach: function (context) {
      $('#banner-close', context).click(function () {
        $('#banner-close').closest('.block').hide();
      });
    }
  };

})(jQuery, Drupal);
