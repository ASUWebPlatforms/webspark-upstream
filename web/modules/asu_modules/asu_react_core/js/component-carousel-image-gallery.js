(function ($, Drupal, drupalSettings) {

  Drupal.behaviors.imageGalleryCarousel = {
    attach: function (context, settings) {
      var componentLoaded = typeof AsuWebCarousel !== "undefined" && typeof AsuWebCarousel.initImageGalleryCarousel !== "undefined";
      var imageGalleryExist = typeof settings.asu !== "undefined" && typeof settings.asu.components !== "undefined" && typeof settings.asu.components.gallery !== "undefined";

      if (!imageGalleryExist || !componentLoaded) {
        return;
      }
      for (var imageId in settings.asu.components.gallery) {
        var carouselData = settings.asu.components.gallery[imageId];
        var images = [];
        carouselData.items.forEach(function(item) {
          images.push(settings.asu.components.gallery_image[item]);
        });

        var type = carouselData.type
         AsuWebCarousel.initImageGalleryCarousel({
            targetSelector: "#imageGalleryCarouselContainer" + imageId,
            props: {
              perView: "2",
              imageItems: images,
              maxWidth: "996px",
              hasContent:  true,
            },
          });

        delete settings.asu.components.gallery[imageId];
      }
    }
  };

})(jQuery, Drupal, drupalSettings);
