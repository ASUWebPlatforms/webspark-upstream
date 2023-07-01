(function ($, Drupal, drupalSettings) {
  var converted_json;

  Drupal.behaviors.expertiseField = {
    attach: function (context, settings) {
      // Check if there are directory type fields.
      if ($(context).find('.expertise-tree').length) {
        $('.expertise-tree').each(function(index) {
          var default_values = [];
          try {
            default_values = $(this).val().split('|');
          }
          catch (e) {}
          var tree_target_obj = $(this).siblings('#expertise-tree-options');
          $.getJSON("/endpoint/expertise-areas", function(json) {
            // Convert and check the default values.
            converted_json = convert_dir(json, default_values);
            // Add the jstree to the object.
            tree_target_obj // listen for event
            .on('changed.jstree', function (e, data) {
                var i, j, r = [];
                for(i = 0, j = data.selected.length; i < j; i++) {
                  r.push(data.instance.get_node(data.selected[i]).id);
                }
                $(this).siblings(".expertise-tree").val(r.join(',')).trigger('change');
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
                  "icon" : "fa fa-cogs"
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

// Convert the json from the directory to be compatible with the jstree.
function convert_dir(data, default_values) {
  var siblings = [];
  $(data).each(function (i, element) {
    var new_element = {};
    new_element.id = element.name;
    new_element.text = element.name;
    let default_values_array = default_values[0].split(",");
    if (default_values_array.includes(element.name.toString())) {
      new_element.state = {'selected' : true};
    }

    siblings.push(new_element);
  });

  return siblings;
}

})(jQuery, Drupal, drupalSettings);
