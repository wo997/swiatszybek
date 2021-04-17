<?php //hook[helper]

function getAllCarriers()
{
    return DB::fetchArr("SELECT * FROM carrier");
}

function preloadCarriers()
{
    $carriers = json_encode(getAllCarriers());
    return <<<JS
    carriers = $carriers;
    loadedCarriers();
JS;
}
