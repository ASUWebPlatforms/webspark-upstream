(function ($, Drupal, drupalSettings) {
  var converted_json;

  Drupal.behaviors.asuriteIdField = {
    attach: function (context, settings) {
      // Check if there are directory type fields.
      if ($(context).find('.asurite-tree').length) {
        $('.asurite-tree').each(function(index) {
          // Convert and check the default values.
          var default_values = [];
          try {
            default_values = $('.asurite-tree').val().split(',');
          }
          catch (e) {}
          create_tree(default_values);
          $( ".directory-tree" ).change(function() {
            if ($(this).val() === '') {
              $(".asurite-tree").val('');
            }
            default_values = $('.asurite-tree').val().split(',');
            // Destroy the tree.
            $('#asurite-tree-options').jstree('destroy').empty();
            // Recreate tree with the default values.
            create_tree(default_values);
          });
        });
      }
    }
  };

// Convert the json from the asuriteid to be compatible with the jstree.
function convert_asurite_to_tree(data, default_values, departments) {
  var result = [];
  $(data).each(function (i, element) {
    $(element.deptids).each(function (j, deptid) {
      if (departments.includes(deptid)) {
        var new_element = {};
        new_element.id = '"' + element.asuriteId + '"-' + deptid;
        new_element.text = element.firstName + " " + element.lastName + ", " + element.departments[j];
        if (default_values.includes(new_element.id)) {
          new_element.state = {'selected' : true}
        }
        new_element.type = "person";
        result.push(new_element);
      }
    });
  });
  return result;
}

// Prepare parameters for the asurite id solr call.
function createCallParams(ids, filters) {
  return "?q=deptids:(" + ids.join(' OR ') + ")&&fl=" + filters.join(',') + "&rows=100&wt=json";
}

// Create the asurite id checkboxes.
function create_tree(default_values) {
  var departments = $( ".directory-tree" ).val().split(',');
  var query = createCallParams(departments, ["asuriteId", "lastName", "firstName", "deptids", "departments"]);
  $.getJSON("/isearch"+query, function(json) {
    converted_json = convert_asurite_to_tree(json.response.docs, default_values, departments);
    $('#asurite-tree-options') // listen for event
    .on('changed.jstree', function (e, data) {
        var i, j, r = [];
        for(i = 0, j = data.selected.length; i < j; i++) {
          r.push(data.instance.get_node(data.selected[i]).id);
        }
        $(this).siblings(".asurite-tree").val(r.join(','));
      })
    .jstree({
      'core' : {
        'data' : converted_json,
        'themes' : { dots: false }
      },
      "checkbox" : {
        "keep_selected_style" : false,
        "three_state" : false
      },
      types: {
        "person": {
          "icon" : "fa fa-user"
        },
        "default" : {
        }
      },
      "plugins" : [ "checkbox", "types" ]
    });
  });
 
}

})(jQuery, Drupal, drupalSettings);