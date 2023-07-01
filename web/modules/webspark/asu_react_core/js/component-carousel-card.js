(function ($, Drupal, drupalSettings) {

  Drupal.behaviors.cardCarousel = {
    attach: function (context, settings) {
      var componentLoaded = typeof AsuWebCarousel !== "undefined" && typeof AsuWebCarousel.initCardCarousel !== "undefined";
      var cardExist = typeof settings.asu !== "undefined" && typeof settings.asu.components !== "undefined" && typeof settings.asu.components.card_carousel !== "undefined";

      if (!cardExist || !componentLoaded) {
        return;
      }

      for (var cardId in settings.asu.components.card_carousel) {
        var carouselData = settings.asu.components.card_carousel[cardId];
        var cards = [];
        carouselData.items.forEach(function(item) {
          cards.push(settings.asu.components.card[item]);
        });

        // Setup and initialize the Card carousel.
        AsuWebCarousel.initCardCarousel({
          targetSelector: '#' + carouselData.targetSelector,
          props: {
            perView: carouselData.perView,
            cardItems: cards,
            cardType: carouselData.cardType,
            imageAutoSize: true,
            cardHorizontal: carouselData.cardHorizontal,
          },
        });

        delete settings.asu.components.card_carousel[cardId];
      }
    }
  };

})(jQuery, Drupal, drupalSettings);