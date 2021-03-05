<?php //route[/{ADMIN}product/feature/all_with_options]

Request::jsonResponse([
    "features" => getAllProductFeatures(),
    "options" => getAllProductFeatureOptions(),
]);
