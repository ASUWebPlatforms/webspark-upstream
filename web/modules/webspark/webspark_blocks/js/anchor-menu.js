(function ($, Drupal, drupalSettings, once) {
  Drupal.behaviors.anchorMenu = {
    attach: function (context, settings) {
      $(once('anchorMenuInit', '#uds-anchor-menu', context)).each(function () {
        const $anchorMenuEl = $(this);
        const $links = $('.webspark-anchor-link-data');
        if (!$links.length) return;

        const anchorMenuNav = $anchorMenuEl.find('nav');
        const heading = $('.uds-anchor-menu-wrapper').find('h2').text().toLowerCase().trim();

        // NOTE: Leaving this code here for now, if after full testing is complete and
        // the issue is not present, this should be removed before the next release.
        // If the user is an admin, we clear the anchor menu items to not duplicate links
        // if (drupalSettings.is_admin) {
        //   $(once('clear-anchor-menu-items', anchorMenuNav, context)).each(function() {
        //     anchorMenuNav.empty();
        //   });
        // }

        $(once('append-anchor-menu-items', $links, context)).each(function (i, item) {
          const icon = $(item).siblings('.anchor-link-icon').html();
          const title = $(item).data('title');
          const href = $(item).attr('id');
          const dataTitle = title.toLowerCase();
          const markup = `<a class="nav-link" data-ga-event="link" data-ga-action="click" data-ga-name="onclick" data-ga-type="internal link" data-ga-region="main content" data-ga-component="" data-ga-section="${heading}" data-ga-text="${dataTitle}" href="#${href}"><span>${icon}</span>${title}</a>`;

          anchorMenuNav.append(markup);
        });

        // Give the React header time to render
        setTimeout(function () {
          initializeAnchorMenu();
        }, 100);

        // After render otherwise it will attach to the wrong element
        $anchorMenuEl.show();
      });
    }
  };

  // Customized version of initializeAnchorMenu for Drupal
  // See: https://github.com/ASU/asu-unity-stack/blob/dev/packages/unity-bootstrap-theme/stories/atoms/anchor-menu/anchor-menu.js
  // See: https://asudev.jira.com/browse/WS2-1961
  function initializeAnchorMenu() {
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
      navbar.classList.add('uds-anchor-menu-attached');
    }

    /**
     * Calculates the percentage of an element that is visible in the viewport.
     *
     * @param {Element} el The element to calculate the visible percentage for.
     * @return {number} The percentage of the element that is visible in the viewport.
     */
    // Custom code added for Drupal
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

    window.addEventListener('scroll', function () {
      // Custom code added for Drupal
      const elements = document.querySelectorAll('[id^="webspark-anchor-link--"]');
      let max = 0;
      elements.forEach(function (el) {
        const parentVisiblePercentage = calculateVisiblePercentage(el.parentNode);
        if (parentVisiblePercentage > 0 && parentVisiblePercentage > max) {
          max = parentVisiblePercentage;
          document.querySelector('[href="#' + el.id + '"]').classList.add('active');
          document.querySelectorAll('a[href^="#webspark-anchor-link--"]:not([href="#' + el.id + '"])').forEach(function (e) {
            e.classList.remove('active');
          });
        }
      });

      // Standard code
      const navbarY = navbar.getBoundingClientRect().top;
      const headerHeight = globalHeader.classList.contains('scrolled') ? globalHeader.offsetHeight - 32 : globalHeader.offsetHeight; // 32 is the set height of the gray toolbar above the global header.

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
        if (window.scrollY === 0) {
          scrollBy += approximateHeaderSize;
        }

        // If navbar hasn't been stickied yet, that means global header is still in view, so compensate for header height
        if (!navbar.classList.contains('uds-anchor-menu-sticky')) {
          if (window.scrollY > 0) {
            scrollBy += 24;
          }
          scrollBy -= globalHeader.offsetHeight;
        }

        window.scrollBy({
          top: scrollBy,
          behavior: 'smooth',
        });

        // Remove active class from other anchor in navbar, and add it to the clicked anchor
        const active = navbar.querySelector('.nav-link.active');

        if (active) {
          active.classList.remove('active');
        }

        e.target.classList.add('active');
      });
    }
  }
})(jQuery, Drupal, drupalSettings, once);
