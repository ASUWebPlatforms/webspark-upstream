(function ($, Drupal, drupalSettings, once) {
  Drupal.behaviors.webSparkWebDir = {
    attach: function (context, settings) {
      var componentLoaded =
        typeof webdirUI !== "undefined" &&
        typeof webdirUI.initSearchPage !== "undefined";

      if (!componentLoaded) {
        return;
      }

      const elements = once("webSparkWebDir", ".webdir-container", context);

      $loggedIn = drupalSettings.user.uid !== 0;

      elements.forEach((value, index) => {
        props = {
          searchType: value.dataset.searchType,
          API_URL: value.dataset.searchUrl.replace(/\/$/, "") + "/",
          searchApiVersion:
            value.dataset.searchApiVersion.replace(/^\/|\/$/g, "") + "/",
          loggedIn: $loggedIn,
          peopleSearch: value.dataset.peopleSearch,
          ids: value.dataset.asuriteIds,
          deptIds: value.dataset.deptIds,
          filters: {
            employee: value.dataset.filterEmployee,
            expertise: value.dataset.filterExpertise,
            title: value.dataset.filterTitle,
            campuses: value.dataset.filterCampuses,
          },
          display: {
            defaultSort: value.dataset.defaultSort,
            usePager: value.dataset.usePager,
            profilesPerPage: value.dataset.profilesPerPage,
            doNotDisplayProfiles: value.dataset.doNotDisplayProfiles,
          },
          appPathFolder: value.dataset.appPathFolder,
        };

        webdirUI.initWebDirectory({
          targetSelector: "#" + value.id,
          props: props,
        });
      });
    },
  };
})(jQuery, Drupal, drupalSettings, once);
