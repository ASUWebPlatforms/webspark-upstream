(function ($, Drupal, drupalSettings) {
  var converted_json;

  Drupal.behaviors.webdirAsuriteField = {
    attach: function (context, settings) {
      // Check if there are directory type fields.
      if ($(context).find('.asurite-tree').length) {
        $('.asurite-tree').each(function(index) {
          // Convert and check the default values.
          var values = [];
          var default_values = [];
          try {
            values = $('.asurite-tree').val().split(',');
          }
          catch (e) {}
          initialize_tree(values);

          // Add people from Asurite Add field.
          $("#asurite-add-options").on("select_node.jstree", function (e, data) {
            if (data.node.id.includes(":")) {
              // Get the existing values
              default_values = $('.asurite-tree').val().split(',');
              if (!default_values.includes(data.node.id)) {
                // Add the person to the tree.
                default_values.push(data.node.id);
                // Recreate tree with the default values.
                update_tree(default_values);
              }
            }
          });

          // Add people from Search.
          $("#asurite-add-people-options").on("select_node.jstree", function (e, data) {
            if (data.node.id.includes(":")) {
              // Get the existing values
              default_values = $('.asurite-tree').val().split(',');
              if (!default_values.includes(data.node.id)) {
                // Add the person to the tree.
                default_values.push(data.node.id);
                // Recreate tree with the default values.
                update_tree(default_values);
              }
            }
          });

          // Remove people on click.
          $("#asurite-tree-options").on("select_node.jstree", function (e, data) {
            // Get the existing values
            default_values = $('.asurite-tree').val().split(',');
            // Add the person to the tree.
            values = default_values.filter(function(item) {
              return item !== data.node.id;
            });
            // Recreate tree with the default values.
            update_tree(values);
          });

          $("#asurite-tree-options").on('move_node.jstree', () => {
              const sortableList = $('#asurite-tree-options li');
              const idString = Array.from(sortableList).map(node => node.id).toString();
              $('.asurite-tree').val(idString);
          });
        });
      }
    }
  };

  function build_post_data(values) {
    var postData = {'profiles': [], 'size': 100, 'page': 1, 'sort': 'last_name_asc' };
    for (const pair of values) {
      const pairValues = pair.split(":");
      postData.profiles.push({"asurite_id": pairValues[0], "dept_id": pairValues[1]});
    }

    return postData;
  }

  // Create the asurite id checkboxes.
  function initialize_tree(values) {
    // Add the values to the actual field.
    $('.asurite-tree').val(values.join(','));
    // Build the post data.
    var postData = build_post_data(values);
    // Call the API to get the information.
    $.post("/endpoint/profiles-by-department", JSON.stringify(postData), function(data) {
      converted_json = convert_asurite_to_tree(data);

      $('#asurite-tree-options').jstree({
        'core' : {
          'data' : converted_json,
          'themes' : { dots: false },
          'check_callback' : true
        },
        types: {
          "person": {
            "icon" : "fa fa-user",
            "valid_children" : [],
          },
          "default" : {
          }
        },
        "plugins" : [ "types", "dnd" ],
      });
    }, "json");

  }

  // Create the asurite id checkboxes.
  function update_tree(values) {
    // Add the values to the actual field.
    $('.asurite-tree').val(values.join(','));
    // Build the post data.
    var postData = build_post_data(values);
    // Call the API to get the information.
    $.post("/endpoint/profiles-by-department", JSON.stringify(postData), function(data) {
      converted_json = convert_asurite_to_tree(data);
      $('#asurite-tree-options').jstree(true).settings.core.data = converted_json;
      $('#asurite-tree-options').jstree(true).refresh();
    });
  }

  // Convert the json from the asuriteid to be compatible with the jstree.
  function convert_asurite_to_tree(data) {
    var result = [];

    $(data).each(function (i, element) {
      if (element.asurite_id) {
        var new_element = {};
        let title = element.title;
        new_element.id = element.asurite_id + ':' + element.dept_id;
        new_element.text = element.display_name + ', ' + element.asurite_id +
                  ', ' + element.dept_name + ', ' + title;
        new_element.type = "person";
        result.push(new_element);
      }
    });
    return result;
  }



})(jQuery, Drupal, drupalSettings);
