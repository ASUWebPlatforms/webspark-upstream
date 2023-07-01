(function ($, Drupal, drupalSettings) {

  Drupal.behaviors.webdirAddPeopleField = {
    attach: function (context, settings) {
      // Check if there are directory type fields.
      if ($(context).find('.asurite-add-people').length) {
        $('.asurite-add-people').each(function (index) {
          // Convert and check the default values.
          initialize_tree();

          let search_timeout = null;
          $(".field--name-field-people-search input").keyup(function () {
            var value = this.value;
            if (value.length >= 2) {
              clearTimeout(search_timeout);
              search_timeout = setTimeout(function () {
                // Populate the tree
                searchPeople(value);
              }, 500);
            } else {
              // Empty the results.
            }
          });
        });
      }
    }
  };

  // Create the asurite id checkboxes.
  function initialize_tree() {
    $('#asurite-add-people-options') // listen for event
      .jstree({
        'core': {
          'data': [],
          'themes': {dots: false},
          'check_callback': true
        },
        types: {
          "person": {
            "icon": "fa fa-user"
          },
          "dept": {
            "icon": "fa fa-bookmark"
          },
          "default": {}
        },
        "plugins": ["types"]
      });
  }

  function searchPeople(queryString) {
    var query = "?query=" + queryString + "&size=20";
    $.getJSON("/endpoint/search-staff" + query, function (json) {
      if (json.results.length > 0) {
        var d = [];
        json.results.forEach(el => {
          // Process profiles that are not for courtesy affiliates.
          if (el.primary_affiliation !== undefined && el.primary_affiliation.raw != null &&
            el.primary_affiliation.raw !== "COURTESY_AFFILIATE") {
            // person
            let p = {};
            p.id = el.asurite_id.raw;
            p.parent = '#';
            p.text = el.display_name.raw + ', ' + el.asurite_id.raw;
            p.type = 'person';

            // department(s)
            if (typeof el.deptids !== 'undefined' &&
              el.deptids.raw !== null &&
              el.deptids.raw.length > 0
            ) {
              el.deptids.raw.forEach(function (dt, index) {
                let title = el.titles.raw[index];
                if (title == null && el.primary_title !== undefined) {
                  title = el.primary_title.raw[0];
                }
                let child = {};
                child.id = el.asurite_id.raw + ':' + dt;
                child.parent = el.asurite_id.raw;
                child.text = title + ', ' + el.departments.raw[index];
                child.type = 'dept';

                d.push(child);
              });
            } else {
              let title = el.titles !== undefined && el.titles.raw !== null && el.titles.raw.length > 0 ? el.titles.raw[0] : null;
              if (title == null && el.primary_title !== undefined && el.primary_title.raw !== null && el.primary_title.raw.length > 0) {
                title = el.primary_title.raw[0];
              } else if (el.working_title !== undefined && el.working_title.raw !== null && el.working_title.raw.length > 0) {
                title = el.working_title.raw[0];
              }
              let affil = el.departments !== undefined && el.departments.raw !== null && el.departments.raw.length > 0 ? el.departments.raw[0] : null;
              if (affil === null && el.primary_search_department_affiliation !== undefined &&
                el.primary_search_department_affiliation.raw !== null &&
                el.primary_search_department_affiliation.raw.length > 0) {
                affil = el.primary_search_department_affiliation.raw[0];
              }
              let child = {};
              child.id = el.asurite_id.raw + ':' + 'unaffiliated';
              child.parent = el.asurite_id.raw;
              child.text = title + ', ' + affil;
              child.type = 'dept';

              d.push(child);
            }
            d.push(p);
          }
          // Process profiles that have a primary_affiliation of 'courtesy affiliate'.
          else {
            let p = {};
            p.id = el.asurite_id.raw;
            p.parent = '#';
            p.text = el.display_name.raw + ', ' + el.asurite_id.raw;
            p.type = 'person';

            if (el.primary_affiliation !== undefined && el.primary_affiliation.raw !== null &&
              el.primary_affiliation.raw === "COURTESY_AFFILIATE") {
              let title = "Courtesy Affiliate"
              let affil = "Arizona State University";
              if (el.subaffiliations !== undefined &&
              el.subaffiliations.raw !== null &&
              el.subaffiliations.raw.length > 0) {
                affil = el.subaffiliations.raw[0];
              }
              else if (el.subaffiliation_departments !== undefined &&
                  el.subaffiliation_departments.raw !== null &&
                  el.subaffiliation_departments.raw.length > 0) {
                affil = el.subaffiliation_departments.raw[0];
              }

              let child = {};
              child.id = el.asurite_id.raw + ':' + 'unaffiliated';
              child.parent = el.asurite_id.raw;
              child.text = title + ', ' + affil;
              child.type = 'dept';

              d.push(child);
            }
            d.push(p);
          }
        });
      }

      update_tree(d);
    });
  }

  // Create the asurite id checkboxes.
  function update_tree(json) {
    // Get existing data.
    $('#asurite-add-people-options').jstree(true).settings.core.data = json;
    $('#asurite-add-people-options').jstree(true).refresh();
  }

})(jQuery, Drupal, drupalSettings);
