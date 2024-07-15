(function () {
  "use strict";

  Drupal.behaviors.renovation = {
    attach: function (context, settings) {
      const toggler = (url, state) => {
        if (url.indexOf("#") !== -1) {
          const sectionName = url.split("#").at(-1);
          const link = document.getElementById(sectionName);

          if (link) {
            const section = link.closest(".accordion-item");
            const content = section.querySelector(".accordion-body");

            link.setAttribute("aria-expanded", state);

            if (state) {
              content.classList.add("show");
            } else {
              content.classList.remove("show");
            }
          }
        }
      };

      window.addEventListener("hashchange", (event) => {
        toggler(event.oldURL, false);
        toggler(event.newURL, true);
      });

      window.addEventListener("DOMContentLoaded", () => {
        toggler(window.location.href, true);
      });

      const items = document.querySelectorAll(".layout-builder-update-block [data-drupal-selector$='-subform-field-expanded-value']");
      const labels = document.querySelectorAll(".layout-builder-update-block [data-drupal-selector$='-subform-field-expanded-value']+label")
      let i = 0;
      items.forEach((item) => {
        if (i > 0) {
          item.setAttribute("style", "display:none;");
        }
        i++;
      });
      let j = 0;
      labels.forEach((label) => {
        if (j > 0) {
          label.setAttribute("style", "display:none;");
        }
        j++;
      });
    },
  };
})();
