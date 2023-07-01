(function ($, Drupal, drupalSettings) {

  Drupal.behaviors.select2alter = {
    attach: function (context) {

      $('select').on('select2-init', function(config) {
        var data = $(this).data('select2-config');

        data.escapeMarkup = function(m) {return m;};
        data.minimumResultsForSearch = -1;
        data.dropdownCssClass = 'select2-flex-view';

        $(this).data('select2-config', data);
      });
    }
  };
})(jQuery, Drupal, drupalSettings);
