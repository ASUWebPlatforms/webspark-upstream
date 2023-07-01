(function ($, Drupal) {

  'use strict';

  Drupal.behaviors.fixedTables = {
    attach: function (context) {

      /**
       * IMPORTANT!
       * Do not delete this function, even if we dont have this code in UDS.
       * This is a workaround to add the required elements for the UDS tables,
       * which are not added by the ckeditor plugin.
       *
       */
      function addFixedWrappers() {
        $('.uds-table-fixed').each(function( index ) {
          var wrapper = document.createElement('div');
          $(wrapper).addClass('uds-table-fixed-wrapper');
          // Add buttons prev and next.
          $(this).wrap(wrapper);
          var added_wrapper = $(this).parent();
          $(added_wrapper).prepend('<div class="scroll-control next"><button type="button" class="btn btn-circle btn-circle-alt-gray"><i class="fas fa-chevron-right"></i><span class="sr-only">Next</span></button></div>');
          $(added_wrapper).prepend('<div class="scroll-control previous"><button type="button" class="btn btn-circle btn-circle-alt-gray"><i class="fas fa-chevron-left"></i><span class="sr-only">Previous</span></button></div>');
        });
      }

      /**
       * Javascript for fixed table functionality. Fixed table should display scroll buttons when hovering over scrollable portion of table,
       * and hide them when hovering over fixed column or when mouse exits table.
       *
       * The scroll buttons must be outside the table container, within the table wrapper, due to the absolute positioning requirements.
       * Because the table scrolls, if they were to be absolutely positioned in the same container as the table, they would scroll with it.
       */
      window.addEventListener('DOMContentLoaded', function () {
        addFixedWrappers();
        initializeFixedTable();
      });



      function initializeFixedTable() {
        const wrapper = document.querySelector('.uds-table-fixed-wrapper');
        if (wrapper === null) {
          return;
        }

        const container = wrapper.querySelector('.uds-table-fixed');
        const previous = wrapper.querySelector('.scroll-control.previous');
        const next = wrapper.querySelector('.scroll-control.next');

        // If the user leaves the scrollable area, hide the scroll
        wrapper.addEventListener('mouseleave', function () {
          previous.classList.remove('show');
          next.classList.remove('show');
        });

        ['click', 'focus'].forEach((event) => {
          previous.addEventListener(event, function () {
            // Scroll can't go beyond it's bounds, so don't need to do checks here (once it hits zero, it won't go lower)
            container.scrollLeft -= 100;
          });

          next.addEventListener(event, function () {
            container.scrollLeft += 100;
          });
        });
      }
    }
  }
})(jQuery, Drupal);
