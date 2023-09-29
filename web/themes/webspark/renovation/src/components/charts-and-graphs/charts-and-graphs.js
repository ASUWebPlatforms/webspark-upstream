(function ($, Drupal) {
  "use strict";

  Drupal.behaviors.donutChart = {
    attach: function (context) {
      $(".uds-charts-and-graphs-container", context)
        .once("chartsGraphs")
        .each(function () {
          var $percentage = $(this).attr("data-number");
          var ctx = $(this).find("canvas", context);
          const config = {
            type: "doughnut",
            data: {
              datasets: [
                {
                  data: [$percentage, 100 - $percentage],
                  backgroundColor: ["#FFC627", "#FAFAFA"],
                },
              ],
            },
            options: {
              cutout: "70%",
              tooltips: { enabled: false },
              events: [],
            },
          };
          var myChart = new Chart(ctx, config);
        });
    },
  };
})(jQuery, Drupal);
