(function ($, Drupal, drupalSettings) {
  var converted_json;
  let currentPage = 1;
  let currentSize = 100
  let totalPages;

  Drupal.behaviors.webdirListField = {
    attach: function (context, settings) {
      // Check if there are directory type fields.
      if ($(context).find('.asurite-list').length) {
        $('.asurite-list').each(function(index) {
          // Convert and check the default values.
          initialize_tree();
          sort_option_rules(context);
          $(".directory-tree").on('change', function() {
            // Update the tree.
            update_tree(currentSize);
            sort_option_rules(context);
          });
          $(".campus-tree").on('change', function() {
            // Update the tree.
            update_tree(currentSize);
          });
          $(".expertise-tree").on('change', function() {
            // Update the tree.
            update_tree(currentSize);
          });
          $(".employee-type-tree").on('change', function() {
            // Update the tree.
            update_tree(currentSize);
          });
          $(".field--name-field-filter-title textarea").on('change', function() {
            // Update the tree.
            update_tree(currentSize);
          });

          // Hide "Web Directory customized sort" option by conditions.
          // @see https://asudev.jira.com/browse/ASUIS-574
          $(
            ".form-item-settings-block-form-field-component-type select",
            context
          ).on("change", function () {
            sort_option_rules(context);
          });
        });
      }
    }
  };

  function sort_option_rules(context) {
    let componentType = $(context).find(":selected", context).val();
    let sortOptions = $(
        ".form-item-settings-block-form-field-default-sort select option",
        context
    );
    let units = $("#directory-tree-options").find("a.jstree-clicked").length
    sortOptions.each(function () {
      let val = $(this).val();
      if (componentType !== "departments") {
        $(this).show();
      }
      else if (componentType === "departments") {
        if (val === "people_order") {
          $(this).hide();
          $(this).prop("selected", false);
        }
      }
      else {
        $(this).show();
      }
    });
  }

// Convert the json from the asuriteid to be compatible with the jstree.
function convert_asurite_to_tree(data, departments) {
  var result = [];
  var temp = {};
  $(data).each(function (i, element) {
    if (element.hasOwnProperty('deptids')) {
      $(element.deptids.raw).each(function (j, deptid) {
        var new_element = {};
        if (departments.includes(deptid)) {

          var department_data = getDepartmentData(element, deptid);
          let title = department_data['title'];
          if (title == null && element.primary_title != undefined) {
            title = element.primary_title.raw[0];
          }

          new_element.id = element.asurite_id.raw + ':' + deptid;
          // Remove maybe.
          new_element.sort = element.display_last_name.raw;
          new_element.text = element.display_name.raw + ', ' + element.asurite_id.raw +
                  ', ' + department_data['name']+ ', ' + title;
          new_element.type = "person";
          if (!temp.hasOwnProperty(deptid)) {
            temp[deptid] = [];
          }
          temp[deptid].push(new_element);
        }
      });
    }
  });
  // Collapse and sort the temp into result.
  Object.keys(temp).forEach(deptID => {
    var sorted = temp[deptID];
    result = result.concat(sorted);
  });
  result.sort(function(a, b){
    return (a["sort"] < b["sort"]) ? -1 : (a["sort"] > b["sort"]) ? 1 : 0;
  });

  return result;
}

function getDepartmentData($data, $deptId) {
  var result = [];
  let deptindex = $data.deptids.raw.indexOf($deptId);
  result['name'] = $data.departments.raw[deptindex];
  result['title'] = $data.titles.raw[deptindex];

  return result;
}

// Prepare parameters for the asurite id solr call.
function createCallParams(departments, campuses, expertise, employeeTypes, titles, size, page) {
  var filters = '';

  // Add departments.
  filters = filters + "?dept_ids=" + departments.join(',');
  // Add campuses
  if (campuses.length > 0) {
    filters = filters + "&campuses=" + campuses.join(',');
  }
  // Add expertise
  if (expertise.length > 0) {
    filters = filters + "&expertise_areas=" + expertise.map((value) => encodeURIComponent(value)).join(',');
  }
  // Add employee types
  if (employeeTypes.length > 0) {
    filters = filters + "&employee_types=" + employeeTypes.map((value) => encodeURIComponent(value)).join(',');
  }
  // Add titles
  if (titles.length > 0) {
    filters = filters + "&title=" + titles.join(',');
  }

  if (size > 0) {
    filters = filters + "&size=" + size;
  }
  if (page > 0) {
    filters = filters + "&page=" + page;
  }

  return filters + "&sort-by=last_name_asc";
}

// Create the asurite id checkboxes.
function initialize_tree() {

  $('#asurite-list-options') // listen for event
  .jstree({
    'core' : {
      'data' : [],
      'themes' : { dots: false }
    },
    types: {
      "person": {
        "icon" : "fa fa-user"
      },
      "default" : {
      }
    },
    "plugins" : [ "types" ]
  });
}

// Create the asurite id checkboxes.
function update_tree(size, page) {
  const departments = $(".directory-tree").val().split(',');
  const campuses = $(".campus-tree").val().split(',');
  const expertise = $(".expertise-tree").val().split('|');
  const employeeTypes = $(".employee-type-tree").val().split('|');
  const titles = $(".field--name-field-filter-title textarea").val().split('\n').map((value) => encodeURIComponent(value));
  const query = createCallParams(departments, campuses, expertise, employeeTypes, titles, size, page);

  $.getJSON("/endpoint/filtered-people-in-department"+query, function(json) {
    // Get existing data.
    currentPage = json?.meta?.page?.current;
    totalPages = json?.meta?.page?.total_pages;
    converted_json = convert_asurite_to_tree(json.results, departments);
    $('#asurite-list-options').jstree(true).settings.core.data = converted_json;
    $('#asurite-list-options').jstree(true).refresh();

      if (departments[0] === '') {
        removePaginationButtons();
      } else {
        addButtons();
        let pageIndicator = !document.querySelector(".page-indicator-profiles") ? document.createElement("span") : document.querySelector(".page-indicator-profiles");
        pageIndicator.className = "page-indicator-profiles";
        document.getElementById("profiles-control-options-list")?.firstChild.after(pageIndicator);
        pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
      }
  });
}

// Add Prev and Next buttons
function addButtons() {
  if (document.getElementById("profiles-control-options-list")) return;
  let fragment = new DocumentFragment();
  let el = document.getElementById("asurite-list-options").parentElement;
  let controlsContainer = document.createElement("div");
  controlsContainer.id = "profiles-control-options-list";
  let rightControl = document.createElement("span")
  rightControl.setAttribute("aria-label", "next")
  rightControl.textContent = 'Next';
  rightControl.className = "right-control";
  rightControl.setAttribute("tabindex", "0")
  let leftControl = document.createElement("span")
  leftControl.setAttribute("aria-label", "previous")
  leftControl.textContent = 'Prev';
  leftControl.className = "left-control";
  leftControl.setAttribute("tabindex", "0")

  rightControl.addEventListener("click", function(e) {
    if (currentPage + 1 > totalPages) {
      return
    } else {
      currentPage += 1
      update_tree(currentSize, currentPage)
    }
  })
  leftControl.addEventListener("click", function(e) {
    if (currentPage - 1 < 1) {
     return
    } else {
      currentPage -= 1;
      update_tree(currentSize, currentPage)
    }
  })
  controlsContainer.append(leftControl, rightControl)
  fragment.appendChild(controlsContainer)
  el.appendChild(fragment);
}
function removePaginationButtons() {
  let elem = document.getElementById("profiles-control-options-list");
  elem?.parentNode?.removeChild(elem)
}

})(jQuery, Drupal, drupalSettings);
