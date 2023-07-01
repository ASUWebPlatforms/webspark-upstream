(function($) {
  'use strict';

  $(function() {
    let $sidebars = $('.sidebar');

    function showSubMenuItems() {
      let $foldableItems = $sidebars.find('.card-foldable');

      if ($foldableItems.length > 0) {
        $foldableItems.each(function() {
          $(this).find('.is-active').parent('.card-body').addClass('show has-active-subitem');
          $(this).find('.has-active-subitem').prev('.card-header').find('.nav-link').addClass('is-active');
        });
      }
    }

    if ($sidebars.length > 0) {
      showSubMenuItems();
    }
  });
}(jQuery));
