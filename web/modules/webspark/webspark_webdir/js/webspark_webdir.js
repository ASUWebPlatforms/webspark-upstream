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
            grid: value.dataset.grid,
          },
          alphaFilter: value.dataset.alphaFilter,
          appPathFolder: value.dataset.appPathFolder,
        };

        webdirUI.initWebDirectory({
          targetSelector: "#" + value.id,
          props: props,
        });
      });
      async function toggleWhenFullyLoaded() {
        try {
          const selectors = ['#drupal-off-canvas', '#directory-tree-options', '#campus-tree-options', '#expertise-tree-options', '#employee-type-tree-options', '#asurite-list-options'];
          const elements = await waitForElementsWithObserver(selectors);
          // console.log('Elements found:', elements);
          $(this).toggleFilters();
        } catch (error) {
          console.error(error);
        }
      }

      toggleWhenFullyLoaded().then(() => {
        // Do nothing on success.
      }).catch((error) => {
        console.error('An error occurred:', error);
      });
    },
  };
})(jQuery, Drupal, drupalSettings, once);

function waitForElementsWithObserver(selectors, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const elementsMap = new Map();

    const checkElements = () => {
      selectors.forEach(selector => {
        if (!elementsMap.has(selector)) {
          const element = document.querySelector(selector);
          if (element) {
            elementsMap.set(selector, element);
          }
        }
      });
      if (elementsMap.size === selectors.length) {
        observer.disconnect();
        resolve(Array.from(elementsMap.values()));
      }
    };

    const observer = new MutationObserver(() => {
      checkElements();
    });

    observer.observe(document, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });

    // Initial check in case elements are already present
    checkElements();

    setTimeout(() => {
      observer.disconnect();
      if (elementsMap.size === selectors.length) {
        resolve(Array.from(elementsMap.values()));
      } else {
        reject(new Error(`Elements with selectors "${selectors}" not found within ${timeout}ms`));
      }
    }, timeout);
  });
}

jQuery.fn.extend({
  toggleFilters: function() {
    const componentType = document.querySelector('[data-drupal-selector="edit-settings-block-form-field-component-type"]');
    if (componentType?.options[componentType.selectedIndex].value === 'departments') {
      const defaultSort = document.querySelector('[data-drupal-selector="edit-settings-block-form-field-default-sort"]');
      const titleFilterBlock = document.querySelector('.form-item-settings-block-form-field-filter-title-0-value');
      const campusFilterBlock = document.querySelector('[data-drupal-selector="edit-settings-block-form-field-filter-campus-0"]');
      const expertiseFilterBlock = document.querySelector('[data-drupal-selector="edit-settings-block-form-field-filter-expertise-0"]');
      const employeeTypeFilterBlock = document.querySelector('[data-drupal-selector="edit-settings-block-form-field-filter-employee-0"]');
      const peopleListBlock = document.querySelector('[data-drupal-selector="edit-settings-block-form-field-people-list-0"]');
      const displaySettingsBlock = document.querySelector('[data-drupal-selector="edit-settings-block-form-group-display-settings"]');
      const alphaFilterBlock = document.querySelector('.form-item-settings-block-form-field-webdir-disable-alpha-value');
      let initAlphaFilterCheckboxState = document.querySelector('[data-drupal-selector="edit-settings-block-form-field-webdir-disable-alpha-value"]').checked;

      // Update initAlphaFilterState if changed.
      document.querySelector('[data-drupal-selector="edit-settings-block-form-field-webdir-disable-alpha-value"]')?.addEventListener( 'change', function () {
        initAlphaFilterCheckboxState = document.querySelector('[data-drupal-selector="edit-settings-block-form-field-webdir-disable-alpha-value"]').checked
      })
      // Hide/Show filters if input changes.
      document.querySelector('[data-drupal-selector="edit-settings-block-form-field-default-sort"]').addEventListener('input', function () {
        show(initAlphaFilterCheckboxState);
      });

      function hide() {
        // Hide title filter.
        titleFilterBlock.style.display = 'none';

        // Hide campus filter.
        campusFilterBlock.style.display = 'none';

        // Hide expertise filter.
        expertiseFilterBlock.style.display = 'none';

        // Hide employee type filter.
        employeeTypeFilterBlock.style.display = 'none';

        // Hide people list.
        peopleListBlock.style.display = 'none';

        // Disable alpha filter.
        document.querySelector('[data-drupal-selector="edit-settings-block-form-field-webdir-disable-alpha-value"]').checked = true;
        // Hide alpha filter.
        alphaFilterBlock.style.display = 'none';
      }

      function show(initAlphaFilterCheckboxState) {
        // Show title filter.
        titleFilterBlock.style.display = '';

        // Show campus filter.
        campusFilterBlock.style.display = '';

        // Show expertise filter.
        expertiseFilterBlock.style.display = '';

        // Show employee type filter.
        employeeTypeFilterBlock.style.display = '';

        // Show people list.
        peopleListBlock.style.display = '';

        // Remove disclaimer.
        document.getElementById('filter-disclaimer')?.remove();

        // Set alpha filter checkbox.
        document.querySelector('[data-drupal-selector="edit-settings-block-form-field-webdir-disable-alpha-value"]').checked = initAlphaFilterCheckboxState;
        // Show alpha filter.
        alphaFilterBlock.style.display = '';
      }
    }
  }
});
