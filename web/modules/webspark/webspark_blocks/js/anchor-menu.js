(function ($, Drupal, drupalSettings, once) {

  Drupal.behaviors.anchorMenu = {
    attach: function (context, settings) {
      if ($(context).find('#uds-anchor-menu').length) {
        let links = $('.webspark-anchor-link-data');
        if (!links.length) {
          return;
        }

        let section = $('.uds-anchor-menu-wrapper h4').text().toLowerCase().trim();

        $(once('append-anchor-menu-items', links, context)).each(function(i, item) {
          let icon = $(item).siblings('.anchor-link-icon').html();
          let title = $(item).data('title');
          let href = $(item).attr('id');
          let data_title = title.toLowerCase();

          $('#uds-anchor-menu .nav').append('<a class="nav-link" data-ga-event="link" data-ga-action="click" data-ga-name="onclick" data-ga-type="internal link" data-ga-region="main content" data-ga-component="" data-ga-section="' + section + '" data-ga-text="' + data_title + '" href="#' + href + '">' + icon + '</span>' + title + '</a>');
        });


        $('#ws2HeaderContainer header').attr('id', 'global-header');

        // We use setTimeout to compensate header built by react 🤦
        let navbar = document.getElementById('uds-anchor-menu');

        setTimeout(function() {
          let globalHeader = document.getElementById('global-header');

          // Compensate for a fixed admin toolbar.
          let offset = getAnchorMenuTop();

          initializeAnchorMenu(globalHeader, navbar, offset);
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


  function initializeAnchorMenu(globalHeader, navbar, offset) {
    const anchors = navbar.getElementsByClassName('nav-link');
    const navbarInitialPosition = navbar.getBoundingClientRect().top + window.scrollY;
    const anchorTargets = new Map();
    let previousScrollPosition = window.scrollY;

    // Cache the anchor target elements by mapping them as a key/pair so don't have to
    // parse the dom on every scroll event
    for (anchor of anchors) {
      const targetId = anchor.getAttribute('href').replace('#', '');
      const target = document.getElementById(targetId);
      anchorTargets.set(anchor, target);
    }

    window.addEventListener("scroll", function () {
      const navbarY = navbar.getBoundingClientRect().top;
      const headerHeight = globalHeader.offsetHeight;

      // If scrolling DOWN
      if (
        window.scrollY > previousScrollPosition &&
        !navbar.classList.contains('uds-anchor-menu-sticky')
      ) {
        if (navbarY > offset && navbarY < headerHeight + offset) {
          if (window.innerWidth > 610) { globalHeader.style.top = -(headerHeight - navbarY) + 'px' };
        } else if (navbarY <= offset) {
          if (window.innerWidth > 610) { globalHeader.style.top = -globalHeader.offsetHeight + 'px' };
          navbar.classList.add('uds-anchor-menu-sticky');
          navbar.style.top = getAnchorMenuTop() + 'px';
        }
      }
      // If scrolling UP
      if (
        window.scrollY < previousScrollPosition &&
        window.scrollY < (navbarInitialPosition)
      ) {
        navbar.classList.remove('uds-anchor-menu-sticky');
        if (globalHeader.getBoundingClientRect().top < offset) {
          globalHeader.style.top = getGlobalHeaderTop() + 'px';
        }
      }

      for (let [anchor, target] of anchorTargets) {
        const offsets = navbar.offsetHeight;

        if (
          target.getBoundingClientRect().top < offsets &&
          target.getBoundingClientRect().top + target.offsetHeight > offsets
        ) {
          anchor.classList.add('active');
        } else {
          anchor.classList.remove('active');
        }
      }

      previousScrollPosition = window.scrollY;
    });

    // Set click event of anchors
    for (let [anchor, anchorTarget] of anchorTargets) {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();

        // Compensate for height of navbar so content appears below it
        let scrollBy =
          anchorTarget.getBoundingClientRect().top - navbar.offsetHeight - offset;

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
  }

  /**
   * This functions has the ability to calculate
   * the position where the Anchor menu must be renderized.
   */
  function getAnchorMenuTop() {
    let $toolbarBar = $('#toolbar-bar');
    let $toolbarItemAdministrationTray = $('#toolbar-item-administration-tray');
    let $globalHeader = $('#global-header');

    // On mobile devices the Anchor Menu must be rendered after the global header.
    if (window.innerWidth < 610) return $globalHeader.height();
    // If the Administration toolbar is not rendered
    // the Anchor menu must be rendered at the top of the page.
    if (!$toolbarBar.length) return 0;

    let $navbar = $('#uds-anchor-menu');
    if ($navbar.length && $navbar.hasClass('uds-anchor-menu-sticky')
      && $toolbarItemAdministrationTray.hasClass('is-active')
      && !$toolbarItemAdministrationTray.hasClass('toolbar-tray-vertical')) {
      // If the Administration toolbar and the Secondary Administration toolbar are rendered
      // the Anchor menu must be rendered after the Secondary Administration toolbar.
      return $toolbarItemAdministrationTray.height() + $toolbarBar.height();
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
