(function ($, Drupal, drupalSettings) {
  // Not using behaviors for most of this.
  Drupal.behaviors.AsuDegreeRfiRfiBehavior = {
    attach: function (context, settings) {

      // Behavior code here.

    }
  };

  // Probably don't want this inside the behavior. Fire once and be done!
  // Get config values passed in from AsuDegreeRfiRfiBlock.php
  var props = drupalSettings.asu_degree_rfi.props;

  // Launcher code here.

  // Initialize the RFI form with provided props.
  AsuRfi.initRfi({
    targetSelector: "#rfi-container",
    props: props,
    // props: {
    //   variant: "rfiVariant2", // or rfiVariant1
    //   campus: "NOPREF", // ONLNE, GROUND, NOPREF
    //   college: undefined, // e.g. CES
    //   department: undefined, // e.g. CINFOTECH
    //   studentType: "undergrad",
    //   areaOfInterest: undefined, // e.g. STEM
    //   areaOfInterestOptional: false,
    //   programOfInterest: undefined, // e.g. TSIFTBS
    //   programOfInterestOptional: false,
    //   isCertMinor: false,
    //   country: "US",
    //   stateProvince: "Wyoming", // Only US states or CA provinces
    //   successMsg: "Success. <strong>You made it.</strong>",
    //   test: false,
    //   dataSourceDegreeSearch: undefined, // "https://api.myasuplat-dpl.asu.edu/api/codeset",
    //   dataSourceAsuOnline: undefined, // "https://asuonline.asu.edu/lead-submissions-v3.3/programs",
    //   dataSourceCountriesStates: undefined, // "https://api.myasuplat-dpl.asu.edu/api/codeset/countries",
    //   submissionUrl: "https://httpbin.org/post", // Test endpoint
    // },
  });




// TODO Without jQuery, we get Uncaught ReferenceError: jQuery is not defined.
// Is it required by Drupal or drupalSettings? Would like it working w/o jQuery.
})(jQuery, Drupal, drupalSettings);
