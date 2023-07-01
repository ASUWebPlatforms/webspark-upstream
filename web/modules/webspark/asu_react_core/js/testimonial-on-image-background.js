(function ($, Drupal, drupalSettings) {

  Drupal.behaviors.testimonialOnImageBackground = {
    attach: function (context, settings) {
      var componentLoaded = typeof AsuWebCore !== "undefined" && typeof AsuWebCore.initTestimonial !== "undefined";
      var testimonialBlockExist = typeof settings.asu !== "undefined" && typeof settings.asu.components !== "undefined" && typeof settings.asu.components.testimonial_on_image_background !== "undefined";

      if (!testimonialBlockExist || !componentLoaded) {
        return;
      }

			for (var testimonialId in settings.asu.components.testimonial_on_image_background) {
			var testimonialData = settings.asu.components.testimonial_on_image_background[testimonialId];
				var testimonialId = testimonialData.items[0];
				var testimonial = settings.asu.components.testimonial[testimonialId];

        // Setup and initialize testimonial options.
        AsuWebCore.initTestimonial({
          targetSelector: '#testimonial-' + testimonialId,
          props: {
            quote: {
              title: testimonial.quote.title,
              content:testimonial.quote.content,
              cite: {
                name: testimonial.quote.cite.name,
                description: testimonial.quote.cite.description,
              },
            },
            imageSource: testimonial.imageSource,
            imageAltText: testimonial.imageAltText,
            altText: testimonialData.altText,
            itemStyle: {
              containerCssClass: testimonialData.style,
              titleCssClass: testimonialData.itemTitleCssClass,
            },
          },
        });
				delete settings.asu.components.testimonial_on_image_background[testimonialId];
			}
    }
  };
})(jQuery, Drupal, drupalSettings);