(function () {
  const MAGIC_PARALLAX_FACTOR = 1.2;

  const scrollHandler = () => {
    document.querySelectorAll(".parallax-container").forEach((container) => {
      const the_image = container.querySelector("img");
      the_image.style.minHeight =
        container.offsetHeight * MAGIC_PARALLAX_FACTOR + "px";
      const default_position =
        container.offsetHeight - the_image.height * MAGIC_PARALLAX_FACTOR;
      const distance_to_travel =
        the_image.dataset.parallaxType === "scroll-to"
          ? window.innerHeight
          : window.innerHeight + container.offsetHeight;
      const top_of_container = container.getBoundingClientRect().top;
      const amount_of_distance_travelled =
        window.innerHeight - top_of_container;
      const portion_of_container_scrolled =
        amount_of_distance_travelled / distance_to_travel;

      if (portion_of_container_scrolled < 0) {
        the_image.style.top = default_position + "px";
      } else if (portion_of_container_scrolled > 1) {
        the_image.style.top = "0";
      } else {
        const correct_position =
          default_position * (1 - portion_of_container_scrolled);
        the_image.style.top = correct_position + "px";
      }
    });
  };

  const pushImageParallaxGAEvent = (args) => {
    const { dataLayer } = window;
    const event = {
      event: "link",
      action: "click",
      name: "onclick",
      type: "internal link",
      region: "main content",
      ...args,
    };
    if (dataLayer) dataLayer.push(event);
  };

  // dataLayer elements focus event listener
  const elements = document.querySelectorAll("[data-ga-image-parallax]");
  elements.forEach((element) =>
    element.addEventListener("focus", () => {
      const args = {
        section: element
          .getAttribute("data-ga-image-parallax-section")
          .toLowerCase(),
        text: element.getAttribute("data-ga-image-parallax").toLowerCase(),
      };
      pushImageParallaxGAEvent(args);
    })
  );

  window.addEventListener("scroll", scrollHandler);
})();
