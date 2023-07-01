# WebSpark CAS module

The WebSpark CAS module contains functionality which allows the Elastic Crawler to bypass the CAS redirect and process the web pages successfully.

## Setup

The following setting should be added to the `settings.php` file. If no such setting exists, the default setting will be used.

```php
$settings['webspark_cas_elastic_crawler_regex'] = '/^Elastic-Crawler .*$/';
```

This setting describes the RegExp used to determine the `Elastic Crawler` request based on its `User-Agent` HTTP Header value.
