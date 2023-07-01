(function ($, Drupal, drupalSettings) {
  // Not using behaviors for most of this.
  Drupal.behaviors.AsuBrandHeaderBehavior = {
    attach: function (context, settings) {

      // If the asu brand header is on the page...
      var headerElement = document.getElementById("ws2HeaderContainer");
      if (headerElement) {

        // If toolbar detected, add compatibilty classes for spacing.
        if (document.body.classList.contains('toolbar-fixed')) {
          headerElement.classList.add("asu-brand-toolbar-header-tray-open-compat");
          // Provide means for other modules to deliver css rules based on when
          // header is active. Not needed for our css because it's only loaded
          // when the header is active.
          document.body.classList.add("asu-brand-header-present");
        }
        // For related functionality, see mutationObserver below.

      }
    }
  };

  // Probably don't want this inside the behavior. Fire once and be done!
  // Get config values passed in from AsuBrandHeaderBlock.php
  var props = drupalSettings.asu_brand.props;

  // Pantheon strips some cookie values before they hit PHP, so
  // Attempt to get userName prop in JS here for those instances.
  var name = 'SSONAME=';
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      // Patch SSONAME into props.
      props.userName = c.substring(name.length, c.length);
    }
  }

  // If we find the current path in top level items or in the children, set
  // selected prop, aka active. We do this client side to avoid needing to break
  // the block cache.
  var currentPath = window.location.pathname+window.location.search;
  if (props.navTree){
    for (var index = 0; index < props.navTree.length; index++) {
      if (inActiveTrail(props.navTree[index], currentPath)) {
        props.navTree[index]['selected'] = true;
      }
    }
  }
  
  function inActiveTrail(item, path) {
    // Check if the item path is a match.
    if (item['href'] === path) {
      return true;
    }
    // If the item path is no match and has no sub-items return false.
    if (!item.hasOwnProperty('items') || !item.items.length) {
      return false;
    }
    // If it has children, search the children
    for (var index = 0; index < item.items[0].length; index++) {
      // If the child matches the path return true.
      if (item.items[0][index]['href'] === path) {
        return true;
      }
      // Go down the tree.
      if (inActiveTrail(item.items[0][index], path)) {
        return true;
      }
    }

    return false;
  }
  // Setup a mutation observer and watch body class attributes so we can base
  // header toolbar spacing compatibility classes on that.
  // Ref: https://www.seanmcp.com/articles/event-listener-for-class-change/
  function mutationCallback(mutationsList) {
    mutationsList.forEach(mutation => {
      if (mutation.attributeName === 'class') {
        //console.log(mutation, 'mutation');

        // A class change happened on the body tag. If the header is on the
        // page, check if the class change was made by a toolbar change and
        // apply our CSS class names to adapt dynamically if so.

        var headerElement = document.getElementById("ws2HeaderContainer");
        if (headerElement) {
          var classSuffix = "";
          var vertSuffix = "-vertical";
          // Check if we need to modify classSuffix for vertical tray rules.
          if (document.body.classList.contains('toolbar-vertical')) {
            classSuffix = vertSuffix; // "-vertical"
          }
          else {
            classSuffix = ""; // reset
          }
          // Set open state class
          if (document.body.classList.contains('toolbar-tray-open')) {
              // Always clean up everything first.
              headerElement.classList.remove("asu-brand-toolbar-header-tray-closed-compat" + vertSuffix);
              headerElement.classList.remove("asu-brand-toolbar-header-tray-closed-compat");
              headerElement.classList.remove("asu-brand-toolbar-header-tray-open-compat" + vertSuffix);
              headerElement.classList.remove("asu-brand-toolbar-header-tray-open-compat");
              // Set for current state.
              headerElement.classList.add("asu-brand-toolbar-header-tray-open-compat" + classSuffix);
          }
          // Set closed state class
          else {
            // Always clean up everything.
            headerElement.classList.remove("asu-brand-toolbar-header-tray-open-compat" + vertSuffix);
            headerElement.classList.remove("asu-brand-toolbar-header-tray-open-compat");
            headerElement.classList.remove("asu-brand-toolbar-header-tray-closed-compat" + vertSuffix);
            headerElement.classList.remove("asu-brand-toolbar-header-tray-closed-compat");
            // Set for current state.
            headerElement.classList.add("asu-brand-toolbar-header-tray-closed-compat" + classSuffix);
          }
        }

      }
    })
  }
  var mutationObserver = new MutationObserver(mutationCallback);
  mutationObserver.observe( document.body, { attributes: true } );

  // Initialize the asu_brand component-header header.
  AsuHeader.initGlobalHeader({
    targetSelector: '#ws2HeaderContainer',
    props: props
  });

  // Initialize the cookie-consent banner component if we're configured for it.
  var cookieConsentEnabled = drupalSettings.asu_brand.cookie_consent;
  if (cookieConsentEnabled) {
    window.addEventListener("DOMContentLoaded", event => {
      // Initialize cookie consent banner
      AsuCookieConsent.initCookieConsent({
        targetSelector: "#ws2CookieConsentContainer",
        props: {
          enableCookieConsent: true,
          expirationTime: 90, // Number of days to expire the consent
        },
      });
    });
  }


  // If we have a CAS login link in header, append return path.
  // ?destination=/your/path is currently not supported.
  // Use ?returnto=/your/path instead for now. May eventually be deprecated when
  // destination is supported. See Drupal CAS docs notes on this:
  // https://www.drupal.org/docs/contributed-modules/cas/introduction-setup#s-logging-in
  // Must fire after header is initialized.
  var headerElement = document.getElementById("ws2HeaderContainer");
  if (headerElement) {
    // Get login anchor element.
    var headerLoginElement = headerElement.querySelector(".login-status a");
    // Regex match on /cas and /caslogin paths at end of domain, with or w/o
    // trailing /
    if (headerLoginElement && ( /\/cas[\/]?$/.test(headerLoginElement.href) || /\/caslogin[\/]?$/.test(headerLoginElement.href) )) {
      // Append the returnto parameter.
      headerLoginElement.href += "?returnto=" + window.location.pathname;
    }
  }

// TODO Without jQuery, we get Uncaught ReferenceError: jQuery is not defined.
// Is it required by Drupal or drupalSettings? Would like it working w/o jQuery.
})(jQuery, Drupal, drupalSettings);
