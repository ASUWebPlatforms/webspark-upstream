(function ($, Drupal, drupalSettings) {

  Drupal.behaviors.programDetailPage = {
    attach: function (context, settings) {
      var componentLoaded = typeof AsuDegreePages !== "undefined" && typeof AsuDegreePages.initListingPage !== "undefined";
      var programDetailPageExist = typeof settings.asu_degree_rfi !== "undefined" && typeof settings.asu_degree_rfi.program_detail_page !== "undefined"

      if (!componentLoaded || !programDetailPageExist) {
        return;
      }

      AsuDegreePages.initProgramDetailPage({
        targetSelector: "#degreeDetailPageContainer",
        props: settings.asu_degree_rfi.program_detail_page,
      })

    }
  };
})(jQuery, Drupal, drupalSettings);
