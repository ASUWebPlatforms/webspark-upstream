(function ($, Drupal, drupalSettings, once) {

  Drupal.behaviors.anchorMenu = {
    attach: function (context, settings) {
      if ($(context).find('#uds-anchor-menu').length) {
        let links = $('.webspark-anchor-link-data');
        if (!links.length) {
          return;
        }

        let section = $('.uds-anchor-menu-wrapper h2').text().toLowerCase().trim();

        // If the user is an admin, we clear the anchor menu items to not duplicate links
        if (drupalSettings.is_admin) {
          $(once('clear-anchor-menu-items', '#uds-anchor-menu .nav', context)).each(function() {
            $('#uds-anchor-menu .nav').empty();
          });
        }

        $(once('append-anchor-menu-items', links, context)).each(function(i, item) {
          let icon = $(item).siblings('.anchor-link-icon').html();
          let title = $(item).data('title');
          let href = $(item).attr('id');
          let data_title = title.toLowerCase();

          $('#uds-anchor-menu .nav').append('<a class="nav-link" data-ga-event="link" data-ga-action="click" data-ga-name="onclick" data-ga-type="internal link" data-ga-region="main content" data-ga-component="" data-ga-section="' + section + '" data-ga-text="' + data_title + '" href="#' + href + '">' + icon + '</span>' + title + '</a>');
        });

        // We use setTimeout to compensate header built by react 🤦
        let navbar = document.getElementById('uds-anchor-menu');

        setTimeout(function() {
          initializeAnchorMenu();
        }, 100);

        $('.uds-anchor-menu').show();

        let $toolbarIconMenu = $('.toolbar-icon-menu');
        $toolbarIconMenu.on('click', function(event) {
          setTimeout(() => {
            navbar.style.top = getAnchorMenuTop() + 'px';
          }, 100);
        });

        window.addEventListener('resize', () => {
          navbar.style.top = getAnchorMenuTop() + 'px';
        });
      }
    }
  };

  // The following function is a copy of the initializeAnchorMenu function from the javascript file
  // in https://github.com/ASU/asu-unity-stack/pull/1252. More infor about future consolidation: https://asudev.jira.com/browse/WS2-1961?atlOrigin=eyJpIjoiNGYxZWJjNjA5ZmRlNGExNmEwM2JiZDkxZDYxMTdlNjIiLCJwIjoiaiJ9
  function initializeAnchorMenu () {
    const HEADER_IDS = ['asu-header', 'asuHeader'];

    const globalHeaderId = HEADER_IDS.find((id) => document.getElementById(id));
    const globalHeader = document.getElementById(globalHeaderId);
    const navbar = document.getElementById('uds-anchor-menu');
    const navbarOriginalParent = navbar.parentNode;
    const navbarOriginalNextSibling = navbar.nextSibling;
    const anchors = navbar.getElementsByClassName('nav-link');
    const anchorTargets = new Map();
    let previousScrollPosition = window.scrollY;
    let isNavbarAttached = false;  // Flag to track if navbar is attached to header
    const body = document.body;

    // These values are for optionally present Drupal admin toolbars. They
    // are not present in Storybook and not required in implementations.
    let toolbarBar = document.getElementById('toolbar-bar');
    let toolbarItemAdministrationTray = document.getElementById('toolbar-item-administration-tray');

    let toolbarBarHeight = toolbarBar ? toolbarBar.offsetHeight : 0;
    let toolbarItemAdministrationTrayHeight = toolbarItemAdministrationTray ? toolbarItemAdministrationTray.offsetHeight : 0;

    let combinedToolbarHeightOffset = toolbarBarHeight + toolbarItemAdministrationTrayHeight;
    const navbarInitialTop = navbar.getBoundingClientRect().top + window.scrollY - combinedToolbarHeightOffset;

    // Cache the anchor target elements
    for (let anchor of anchors) {
      const targetId = anchor.getAttribute('href').replace('#', '');
      const target = document.getElementById(targetId);
      anchorTargets.set(anchor, target);
    }

    const shouldAttachNavbarOnLoad = window.scrollY > navbarInitialTop;
    if (shouldAttachNavbarOnLoad) {
      globalHeader.appendChild(navbar);
      isNavbarAttached = true;
      navbar.classList.add("uds-anchor-menu-attached");
    }

    /**
     * Calculates the percentage of an element that is visible in the viewport.
     *
     * @param {Element} el The element to calculate the visible percentage for.
     * @return {number} The percentage of the element that is visible in the viewport.
     */
    function calculateVisiblePercentage(el) {
      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      const windowWidth = window.innerWidth || document.documentElement.clientWidth;

      // Get the dimensions of the element
      const elHeight = rect.bottom - rect.top;
      const elWidth = rect.right - rect.left;

      // Calculate the area of the element
      const elArea = elHeight * elWidth;

      // Calculate the visible area of the element in the viewport
      const visibleHeight = Math.min(windowHeight, rect.bottom) - Math.max(0, rect.top);
      const visibleWidth = Math.min(windowWidth, rect.right) - Math.max(0, rect.left);
      const visibleArea = visibleHeight * visibleWidth;

      // Calculate the percentage of the element that is visible in the viewport
      const visiblePercentage = (visibleArea / elArea) * 100;

      return visiblePercentage;
    }

    window.addEventListener("scroll", function () {
      const elements = document.querySelectorAll('[id^="webspark-anchor-link--"]');
      let max = 0;
      elements.forEach(function(el) {
        const parentVisiblePercentage = calculateVisiblePercentage(el.parentNode);
        if (parentVisiblePercentage > 0 && parentVisiblePercentage > max) {
          max = parentVisiblePercentage;
          document.querySelector('[href="#' + el.id + '"]').classList.add('active');
          document.querySelectorAll('a[href^="#webspark-anchor-link--"]:not([href="#' + el.id + '"])').forEach(function(e) {
            e.classList.remove('active');
          });
        }
      });

      const navbarY = navbar.getBoundingClientRect().top;
      const headerHeight = globalHeader.classList.contains("scrolled") ?  globalHeader.offsetHeight - 32 : globalHeader.offsetHeight; // 32 is the set height of the gray toolbar above the global header.

      // If scrolling DOWN and navbar touches the globalHeader
      if (
        window.scrollY > previousScrollPosition &&
        navbarY > 0 && navbarY < headerHeight
        ) {
          if (!isNavbarAttached) {
            // Attach navbar to globalHeader
            globalHeader.appendChild(navbar);
            isNavbarAttached = true;
            navbar.classList.add('uds-anchor-menu-attached');
          }
          previousScrollPosition = window.scrollY;
        }

      // If scrolling UP and past the initial navbar position
      if (
        window.scrollY < previousScrollPosition &&
        window.scrollY <= navbarInitialTop && isNavbarAttached
      ) {
        // Detach navbar and return to original position
        navbarOriginalParent.insertBefore(navbar, navbarOriginalNextSibling);
        isNavbarAttached = false;
        navbar.classList.remove('uds-anchor-menu-attached');
      }

      previousScrollPosition = window.scrollY;
    }, { passive: true });

    // Set click event of anchors
    for (let [anchor, anchorTarget] of anchorTargets) {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();

        // Compensate for height of navbar so content appears below it
        let scrollBy =
          anchorTarget.getBoundingClientRect().top - navbar.offsetHeight;

        // If window hasn't been scrolled, compensate for header shrinking.
        const approximateHeaderSize = 65;
        if (window.scrollY === 0) scrollBy += approximateHeaderSize;

        // If navbar hasn't been stickied yet, that means global header is still in view, so compensate for header height
        if (!navbar.classList.contains('uds-anchor-menu-sticky')) {
          if (window.scrollY > 0) scrollBy += 24;
          scrollBy -= globalHeader.offsetHeight;
        }

        window.scrollBy({
          top: scrollBy,
          behavior: 'smooth',
        });

        // Remove active class from other anchor in navbar, and add it to the clicked anchor
        const active = navbar.querySelector('.nav-link.active');

        if (active) active.classList.remove('active');

        e.target.classList.add('active');
      });
    }
  };

  /**
   * This functions has the ability to calculate
   * the position where the Anchor menu must be renderized.
   */
  function getAnchorMenuTop() {
    let $toolbarBar = $('#toolbar-bar');
    let $toolbarItemAdministrationTray = $('#toolbar-item-administration-tray');
    let $globalHeader = $('#asuHeader');

    // On mobile devices the Anchor Menu must be rendered after the global header.
    if (window.innerWidth < 610 || !$toolbarBar.length) return $globalHeader.height();

    let $navbar = $('#uds-anchor-menu');
    if ($navbar.length && $navbar.hasClass('uds-anchor-menu-sticky')
      && $toolbarItemAdministrationTray.hasClass('is-active')
      && !$toolbarItemAdministrationTray.hasClass('toolbar-tray-vertical')) {
      // If the Administration toolbar and the Secondary Administration toolbar are rendered
      // the Anchor menu must be rendered after the Secondary Administration toolbar.
      return $toolbarItemAdministrationTray.height() + $toolbarBar.height() + $globalHeader.height();
    }
    else {
      // If the Administration toolbar is rendered and the Secondary Administration toolbar is not rendered
      // or when the Secondary toolbar is a sidebar the Anchor menu must be rendered after the Administration toolbar.
      return $toolbarBar.height();
    }
  }

  function getGlobalHeaderTop() {
    let $toolbarBar = $('#toolbar-bar');
    let $toolbarItemAdministrationTray = $('#toolbar-item-administration-tray');
    if (!$toolbarBar.length) return  0;

    if ($toolbarItemAdministrationTray.hasClass('is-active') && !$toolbarItemAdministrationTray.hasClass('toolbar-tray-vertical')) {
      return $toolbarItemAdministrationTray.height() + $toolbarBar.height();
    }

    return $toolbarBar.height();
  }
})(jQuery, Drupal, drupalSettings, once);
