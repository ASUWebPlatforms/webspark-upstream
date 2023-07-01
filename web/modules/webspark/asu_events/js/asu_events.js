(function ($, Drupal, drupalSettings) {

  Drupal.behaviors.asuEvents = {
    attach: function (context, settings) {
      var componentLoaded = typeof AsuEvents !== "undefined" && typeof AsuEvents.initCardsListEventsComponent !== "undefined";
      var eventsExist = typeof settings.asu.components !== "undefined" && typeof settings.asu.components.asu_events !== "undefined";

      if (!componentLoaded || !eventsExist) {
        return;
      }

      for (var eventsId in settings.asu.components.asu_events) {
        var eventsData = settings.asu.components.asu_events[eventsId];
        switch(eventsData.display) {
          case 'All':
            AsuEvents.initCardsListEventsComponent({
              targetSelector: "#events-wrapper-" + eventsId,
              props: {
                header: eventsData.header,
                ctaButton: eventsData.ctaButton,
                dataSource: eventsData.dataSource,
                maxItems: 500,
              }
            })
            break;
          case 'Three':
            AsuEvents.initCardsListEventsComponent({
              targetSelector: "#events-wrapper-" + eventsId,
              props: {
                header: eventsData.header,
                ctaButton: eventsData.ctaButton,
                dataSource: eventsData.dataSource,
                maxItems: 3,
              }
            })
            break;
          case 'ThreeCards':
            AsuEvents.initCardsGridEventsComponent({
              targetSelector: "#events-wrapper-" + eventsId,
              props: {
                header: eventsData.header,
                ctaButton: eventsData.ctaButton,
                dataSource: eventsData.dataSource,
                maxItems: 3,
              }
            })
            break;
        }
        delete settings.asu.components.asu_events[eventsId];
      }
    }
  };
})(jQuery, Drupal, drupalSettings);
