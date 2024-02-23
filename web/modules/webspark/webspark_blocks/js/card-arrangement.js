(function ($, Drupal, drupalSettings, once) {
  // Define a behavior for handling card arrangement alerts
  Drupal.behaviors.cardArrangementAlert = {
    attach: function (context, settings) {
      // Initialize variables
      const selectCountColumn = document.querySelector('[name="settings[block_form][field_card_arrangement_display]"]');
      const displayOrientation = document.querySelector('[name="settings[block_form][field_display_orientation]"]');
      const displayDiv = document.querySelector('[data-drupal-selector="edit-settings-block-form-field-display-orientation-wrapper"]');

      let rankingOrBased = false;
      // Get the div with the class "ajax-new-content"
      const ajaxNewContentDiv = document.querySelector('.ajax-new-content');
      if (ajaxNewContentDiv) {
        // Get all child elements
        const elements = ajaxNewContentDiv.querySelectorAll('*');
        for (let i = 0; i < elements.length; i++) {
          const attrs = elements[i].attributes; // Get the attributes of the element
          // Iterate through the attributes of the element and check if any contains the word "ranking"
          for (let j = 0; j < attrs.length; j++) {
            if (attrs[j].value.includes('ranking') || attrs[j].value.includes('based')) {
              rankingOrBased = true;
              break; // End the iteration if the word is found
            }
          }
        }
      }
      else {
        rankingOrBased = false;
      }

      // Get the element to identify Ranking cards
      const elementRanking = document.querySelector('[name*="[field_card_ranking_image_size]"]');
      // Get the element to identify Image based cards
      const elementBasedCard = document.querySelector('[name*="[field_loading]"]');

      // Check if the element exists to determine display orientation
      if (elementRanking || elementBasedCard || rankingOrBased) {
        // Hide display orientation
        _showDisplayOrientation('none');
      }
      else {
        // Show display orientation
        _showDisplayOrientation();
      }

      if (settings && settings.columns_values && Array.isArray(settings.columns_values) && selectCountColumn) {
        // Initial setup of options and event listener for display orientation change
        _updateColumnsOptions();
        displayOrientation.addEventListener('change', _updateColumnsOptions);
      }

      // Function to update options in Columns to Display select based on display orientation
      function _updateColumnsOptions() {
        if (displayOrientation && displayOrientation.value === 'horizontal') {
          // Remove options when display orientation is horizontal
          settings.columns_values.forEach(option => {
            const key = Object.keys(option)[0];
            for (let i = selectCountColumn.options.length - 1; i >= 0; i--) {
              if (selectCountColumn.options[i].value === key) {
                selectCountColumn.remove(i);
              }
            }
          });
        }
        else {
          // Add options when display orientation is not horizontal
          settings.columns_values.forEach(option => {
            const key = Object.keys(option)[0];
            const value = option[key];
            if (!Array.from(selectCountColumn.options).some(opt => opt.value === key)) {
              const newOption = document.createElement('option');
              newOption.value = key;
              newOption.text = value;
              selectCountColumn.add(newOption);
            }
          });
        }
      }

      // Function to show or hide Display orientation select
      function _showDisplayOrientation(value = '') {
        if (displayDiv) {
          // Set display style based on value
          displayDiv.style.display = value;
        }
        if (value !== '') {
           // Set display orientation values
          displayOrientation.value = 'vertical';
        }
      }
    }
  };
})(jQuery, Drupal, drupalSettings, once);
