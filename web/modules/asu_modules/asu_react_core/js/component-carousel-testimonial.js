(function ($, Drupal, drupalSettings) {

  Drupal.behaviors.testimonialCarousel = {
    attach: function (context, settings) {
      var componentLoaded = typeof AsuWebCarousel !== "undefined" && typeof AsuWebCarousel.initTestimonialCarousel !== "undefined";
      var testimonialExist = typeof settings.asu !== "undefined" && typeof settings.asu.components !== "undefined" && typeof settings.asu.components.testimonial_carousel !== "undefined";

      if (!testimonialExist || !componentLoaded) {
        return;
      }

      for (var testimonialId in settings.asu.components.testimonial_carousel) {
        var carouselData = settings.asu.components.testimonial_carousel[testimonialId];

        var testimonials = [];
        carouselData.items.forEach(function(item) {
          testimonials.push(settings.asu.components.testimonial[item]);
        });

        AsuWebCarousel.initTestimonialCarousel({
          targetSelector: "#testimonialCarouselContainer" + testimonialId,
          props: {
            testimonialItems: testimonials,
            maxWidth: "500px",
            hasNavButtons: true,
            hasPositionIndicators: true,
            itemStyle: {
              containerCssClass: carouselData.style,
              titleCssClass: carouselData.itemTitleCssClass,
            },
          },
        })

        delete settings.asu.components.testimonial_carousel[testimonialId];
      }
    }
  };

})(jQuery, Drupal, drupalSettings);
