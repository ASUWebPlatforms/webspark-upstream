(function ($, Drupal, drupalSettings) {
  var converted_json;

  Drupal.behaviors.directoryField = {
    attach: function (context, settings) {
      // Check if there are directory type fields.
      if ($(context).find('.directory-tree').length) {
        $('.directory-tree').each(function(index) {
          var default_values = [];
          try {
            default_values = $(this).val().split(',');
          }
          catch (e) {}
          var tree_target_obj = $(this).siblings('#directory-tree-options');
          $.getJSON("/endpoint/departments", function(json) {
            // Convert and check the default values.
            converted_json = convert_dir(json, default_values);
            // Add the jstree to the object.
            tree_target_obj // listen for event
            .on('changed.jstree', function (e, data) {
                var i, j, r = [];
                for(i = 0, j = data.selected.length; i < j; i++) {
                  r.push(data.instance.get_node(data.selected[i]).id);
                }
                $(this).siblings(".directory-tree").val(r.join(',')).trigger('change');
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

// Convert the json from the directory to be compatible with the jstree.
function convert_dir(data, default_values) {
  var siblings = [];
  $(data).each(function (i, element) {
    var new_element = {};
    new_element.id = element.dept_id;
    new_element.text = element.name;
    if (default_values.includes(element.dept_id.toString())) {
      new_element.state = {'selected' : true};
    }
    if (element.children && element.children.length > 0) {
      new_element.children = convert_dir(element.children, default_values);
    }
    else {
      new_element.type = "child";
    }
    siblings.push(new_element);
  });

  return siblings;
}

})(jQuery, Drupal, drupalSettings);
