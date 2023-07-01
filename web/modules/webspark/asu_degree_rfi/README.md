# webspark-module-asu_degree_rfi
Degree and RFI component launcher module.

## About the asu_degree_rfi module
The ASU Degree RFI module provides Webspark 2 integrations for the 
[Unity Design System](https://unity.web.asu.edu) app-degree-pages and 
app-rfi components.

## Installation
Enable the module through the Drupal admin interface like any other
module.

Information about how these components function and are to be
configured within Webspark 2 is found in the admin interface 
for the module at the path `/admin/config/asu_degree_rfi/settings`
in your site.

## Recommended RFI settings overrides
Because you will often be syncing configurations between environments, 
to avoid overwriting an environment's unique RFI Source ID and submission
URL, it is recommended you add code to your site's settings.php to detect
the environment and set its unique values. Below, you will find code
that does this.

Also included with this code are PHP timeout overrides we highly
recommend you make to avoid receiving unnecessary false-positive error
emails regarding RFI delivery timeouts.

In the code below, please replace `<environsSourceIDHere>` with the 
environment's matching Source ID.
```
// Environment-specific RFI settings. Drop this in your settings.php.
if (defined('PANTHEON_ENVIRONMENT')) {
  if (PANTHEON_ENVIRONMENT == 'dev') {
    $config['asu_degree_rfi.settings']['asu_degree_rfi']['rfi_source_id'] = '<environsSourceIDHere>';
    $config['asu_degree_rfi.settings']['asu_degree_rfi']['rfi_submission_handler_url'] = 
      'https://eakemwmmmpql5o523dnfkvvtem0ezhhc.lambda-url.us-west-2.on.aws/';
  }
  else if (PANTHEON_ENVIRONMENT == 'test') {
    $config['asu_degree_rfi.settings']['asu_degree_rfi']['rfi_source_id'] = '<environsSourceIDHere>';
    $config['asu_degree_rfi.settings']['asu_degree_rfi']['rfi_submission_handler_url'] = 
      'https://eakemwmmmpql5o523dnfkvvtem0ezhhc.lambda-url.us-west-2.on.aws/';
  }
  else if (PANTHEON_ENVIRONMENT == 'live') {
    $config['asu_degree_rfi.settings']['asu_degree_rfi']['rfi_source_id'] = '<environsSourceIDHere>';
    $config['asu_degree_rfi.settings']['asu_degree_rfi']['rfi_submission_handler_url'] = 
      'https://5gu33wnsdm2mpgmob4c2rt3mbq0mngfo.lambda-url.us-west-2.on.aws/';
  }
}
// Increase max_execution_time for RFI to wait for response.
ini_set('max_execution_time', '180');
// HTTP Client config for RFI
$settings['http_client_config']['timeout'] = 179; // -1 of max so time to complete
```

## About Degree listing pages and Degree detail pages
The only type of degree pages you need to manually create in your site 
are Degree listing pages. In creating a Degree listing page, you define
the parameters the degree listing component will use to display the links
to the Degree detail pages in the UI. When a user follows one of those
links, if no Degree detail page exists at that path yet it will 
automatically be created.

IMPORTANT NOTE:
Because a Degree detail page relies on the page's path to determine
whether or not to create the page, please do not alter the automatic
path settings for Degree detail pages or edit the path after the page
is created. We have taken measures to prevent you from doing this in
the UI. In cases where the path is altered, duplicated Degree detail
pages will be created.

If you need to map legacy paths, or other paths to a Degree detail
page, please use a redirect in order to preserve the system path.

Additionally, it should be noted that because the parent node ID is 
included on the path of a Degree detail page so that a breadcrumb trail
can be established, if you have a degree appearing in multiple Degree
listing pages, a copy of the Degree detail page will be created for the
context of each Degree listing page. This is considered a feature, and
not a bug as it allows the most flexibility by providing the proper
breadcrumb trail context and allows for each copy of the Degree detail
page to be overridden with customizations for the unique context.
