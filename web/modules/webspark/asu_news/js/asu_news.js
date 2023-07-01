(function ($, Drupal, drupalSettings) {

  Drupal.behaviors.asuNews = {
    attach: function (context, settings) {
      var componentLoaded = typeof AsuNews !== "undefined" && typeof AsuNews.initCardCarouselNewsComponent !== "undefined";
      var newsExist = typeof settings.asu.components !== "undefined" && typeof settings.asu.components.asu_news !== "undefined";

      if (!componentLoaded || !newsExist) {
        return;
      }

      for (var newsId in settings.asu.components.asu_news) {
        var newsData = settings.asu.components.asu_news[newsId];
        switch(newsData.display) {
          case 'Horizontal':
            AsuNews.initCardListNewsComponent({
              targetSelector: "#news-wrapper-" + newsId,
              props: {
                header: newsData.header,
                ctaButton: newsData.ctaButton,
                dataSource: newsData.dataSource,
                maxItems: newsData.maxItems,
                cardButton: newsData.cardButton,

              },
            });
            break;
          case 'Cards':
            AsuNews.initCardGridNewsComponent({
              targetSelector: "#news-wrapper-" + newsId,
              props: {
                header: newsData.header,
                ctaButton: newsData.ctaButton,
                dataSource: newsData.dataSource,
                maxItems: newsData.maxItems,
                cardButton: newsData.cardButton,
              },
            });
            break;
          default:
            AsuNews.initCardCarouselNewsComponent({
              targetSelector: "#news-wrapper-" + newsId,
              props: {
                header: newsData.header,
                ctaButton: newsData.ctaButton,
                dataSource: newsData.dataSource,
                maxItems: newsData.maxItems,
                cardButton: newsData.cardButton,

              },
            });

        }
        delete settings.asu.components.asu_news[newsId];
      }
    }
  };
})(jQuery, Drupal, drupalSettings);