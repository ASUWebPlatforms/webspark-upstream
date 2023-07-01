(function ($, Drupal, drupalSettings) {
  var converted_json;

  Drupal.behaviors.campusField = {
    attach: function (context, settings) {
      // Check if there are campus type fields.
      if ($(context).find('.campus-tree').length) {
        $('.campus-tree').each(function(index) {
          var default_values = [];
          try {
            default_values = $(this).val().split(',');
          }
          catch (e) {}
          var tree_target_obj = $(this).siblings('#campus-tree-options');
          $.getJSON("/endpoint/campuses", function(json) {
            // Convert and check the default values.
            converted_json = convert_dir(json, default_values);
            // Add the jstree to the object.
            tree_target_obj // listen for event
            .on('changed.jstree', function (e, data) {
                var i, j, r = [];
                for(i = 0, j = data.selected.length; i < j; i++) {
                  r.push(data.instance.get_node(data.selected[i]).id);
                }
                $(this).siblings(".campus-tree").val(r.join(',')).trigger('change');
              })
            .jstree({
              'core' : {
                'data' : converted_json,
              },
              "checkbox" : {
                "keep_selected_style" : false,
                "three_state" : false
              },
              types: {
                "root": {
                  "icon" : ""
                },
                "child": {
                  "icon" : "fa fa-bookmark"
                },
                "default" : {
                }
              },
              "plugins" : [ "checkbox", "types" ]
            });
          });
        });
      }
    }
  };

// Convert the json from the campus to be compatible with the jstree.
function convert_dir(data, default_values) {
  var siblings = [];

  Object.keys(data).forEach(campusID => {
    var new_element = {};
    new_element.id = campusID;
    new_element.text = data[campusID];
    if (default_values.includes(campusID.toString())) {
      new_element.state = {'selected' : true};
    }

    siblings.push(new_element);
  });

  return siblings;
}

})(jQuery, Drupal, drupalSettings);
