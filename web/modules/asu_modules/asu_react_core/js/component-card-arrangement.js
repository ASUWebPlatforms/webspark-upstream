(function ($, Drupal, drupalSettings) {

  Drupal.behaviors.cardArrangement = {
    attach: function (context, settings) {
      var componentLoaded = typeof AsuWebCore !== "undefined" && typeof AsuWebCore.initCard !== "undefined";
      var cardExist = typeof settings.asu !== "undefined" && typeof settings.asu.components !== "undefined" && typeof settings.asu.components.card_arrangement !== "undefined";

      if (!cardExist || !componentLoaded) {
        return;
      }

      for (var cardId in settings.asu.components.card_arrangement) {
        var cardData = settings.asu.components.card_arrangement[cardId];

        cardData.items.forEach(function(item) {
          card = settings.asu.components.card[item];
          //Setup and initialize the Card.
          if (card.cardType === "ranking") {
            AsuWebCore.initRankingCard({
              targetSelector: "#card-" + card.id,
              props: {
                imageSize: card.imageSize,
                image: card.imageSource,
                imageAlt: card.imageAltText,
                heading: card.title,
                body: card.content,
                readMoreLink: card.linkUrl,
                citation: card.citation,
                // TODO: RankingCard does not support showBorders
              },
            });
          } else if (card.cardType === "image") {
            AsuWebCore.initImage({
              targetSelector: "#card-" + card.id,
              props: {
                src: card.imageSource,
                alt: card.imageAltText,
                // Optional props
                cssClasses: ["w-100", "ws2-img"],
                loading: card.loading,
                decoding: "auto",
                fetchPriority: "auto",
                cardLink: card.linkUrl,
                title: card.linkLabel,
                caption: card.caption,
                captionTitle: card.captionTitle,
                border: card.showBorders,
                dropShadow: card.dropShadow
              }
            });
          } else {
            AsuWebCore.initCard({
              targetSelector: '#card-' + card.id,
              props: {
                type: card.cardType,
                horizontal: cardData.items_display[item] == 'horizontal',
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
          }
        });

        delete settings.asu.components.card_arrangement[cardId];
      }
    }
  };
})(jQuery, Drupal, drupalSettings);
