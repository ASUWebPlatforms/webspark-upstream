(function ($, Drupal, drupalSettings) {

  Drupal.behaviors.card = {
    attach: function (context, settings) {
      var componentLoaded = typeof AsuWebCore !== "undefined" && typeof AsuWebCore.initCard !== "undefined";
      var cardExist = typeof settings.asu !== "undefined" && typeof settings.asu.components !== "undefined" && typeof settings.asu.components.content_section !== "undefined";

      if (!cardExist || !componentLoaded) {
        return;
      }

      for (var cardId in settings.asu.components.content_section) {
        var cardData = settings.asu.components.content_section[cardId];
	      var cardId = cardData.cardId;
        var card = settings.asu.components.card[cardId];
        //Setup and initialize the Card.
        AsuWebCore.initCard({
          targetSelector: '#card-' + card.id,
          props: {
            type: card.cardType,
            horizontal: false,
            clickable: card.clickable,
            clickHref: card.clickHref,
            image: card.imageSource,
            imageAltText: card.imageAltText,
            title: card.title,
            body: card.content,
            buttons: card.buttons,
            icon: card.icon,
            linkLabel: card.linkLabel,
            linkUrl: card.linkUrl,
            tags: card.tags,
            showBorders: card.showBorders,
          },
        });

        delete settings.asu.components.content_section[cardId];
	    }
    }
  };
})(jQuery, Drupal, drupalSettings);