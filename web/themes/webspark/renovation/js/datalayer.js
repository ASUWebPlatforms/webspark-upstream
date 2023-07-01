(function ($, Drupal) {
  Drupal.behaviors.asugtm = {
    attach: function (context, settings) {
      $('.page__content')
      .once('page')
      .each(function () {
        const pushGAEvent = (event) => {
          const { dataLayer } = window;
          if (dataLayer) dataLayer.push(event);
        };
            
        // Clicks events
        const elements = document.querySelectorAll('[data-ga-text]');
        elements.forEach((element) =>
          element.addEventListener('click', () => {
            const dropdown = element.getAttribute('aria-expanded');
            const name = element.getAttribute('data-ga-name');
            const event = element.getAttribute('data-ga-event');
            const action = dropdown
              ? dropdown === 'false'
                ? 'open'
                : 'close'
              : element.getAttribute('data-ga-action');
            const type = element.getAttribute('data-ga-type');
            const section = element.getAttribute('data-ga-section');
            const region = element.getAttribute('data-ga-region');
            const text = element.getAttribute('data-ga-text');
            const component = element.getAttribute('data-ga-component');
            
            pushGAEvent({
              name: name ? name.toLowerCase() : '',
              event: event ? event.toLowerCase() : '',
              action: action ? action.toLowerCase() : '',
              type: type ? type.toLowerCase() : '',
              section: section ? section.toLowerCase() : '',
              region: region ? region.toLowerCase() : '',
              text: text ? text.toLowerCase() : '',
              component: component ? component.toLowerCase() : '',
            });
          })
        );
        
        /* 
         * WS2-1317 - Send “close” event for the previously open accordion panel to DL
         */

        // Find all accordion divs
        const targetAccordion = document.querySelectorAll('.accordion');
        
        // Loop through each .accordion div and watch for mutation changes
        targetAccordion.forEach((element) => {

          const targetA = element;

          // Observer config
          const config = { 
            attributes: true,
            attributeOldValue : true, 
            childList: true, 
            subtree: true };

          // Callback function to execute when mutations are observed
          // All mutations in .accordion divs are observed, so 
          const callback = (mutationList, observer) => {
            for (const mutation of mutationList) {
              
              // the closing div
              if (mutation.oldValue === 'card-body collapse show') {
                var closeDiv = mutation.target;
                var closeDivId = closeDiv.id;
              }
              // the clicked header
              if (mutation.oldValue === 'collapsed') {
                var clickedHeader = mutation.target.getAttribute('aria-controls');
                // if both the closeDivId and clickedHeader have value, they are not the same, so send to DL
                if (closeDivId && clickedHeader) {
                  const text = closeDiv.parentElement.children[0].innerText;
                  pushGAEvent({
                    name: 'onclick',
                    event: 'collapse',
                    action: 'close',
                    type: 'click',
                    section: 'accordion block',
                    region: 'main content',
                    text: text ? text.toLowerCase() : '',
                    component: '',
                  });
                }
              }
            } 
          };

          // Create an observer instance linked to the callback function
          const observer = new MutationObserver(callback);

          // Start observing the target node for configured mutations
          observer.observe(targetA, config);

        });


        // Input change events
        const inputElements = document.querySelectorAll('[data-ga-input]');
        inputElements.forEach((element) =>
          element.addEventListener('change', (e) => {
            const name = element.getAttribute('data-ga-input-name');
            const event = element.getAttribute('data-ga-input-event');
            const action = element.getAttribute('data-ga-input-action');
            const type = element.getAttribute('data-ga-input');
            const region = element.getAttribute('data-ga-input-region');
            const section = element.getAttribute('data-ga-input-section');
            const text =
              type === 'checkbox' || type === 'radio button'
                ? e.target.labels[0].textContent.toLowerCase()
                : type === 'blur'
                ? e.target.value.toLowerCase()
                : [...e.target.selectedOptions].map((option) =>
                    option.value.toLowerCase()
                  );
            
            pushGAEvent({
              name: name ? name.toLowerCase() : '',
              event: event ? event.toLowerCase() : '',
              action: action ? action.toLowerCase() : '',
              type: type ? type.toLowerCase() : '',
              section: section ? section.toLowerCase() : '',
              region: region ? region.toLowerCase() : '',
              text: text ?? '',
            });
          })
        );
      });
    }
  }
}(jQuery, Drupal));              