<?php //hook[helper]

function getAllVats()
{
    return DB::fetchArr("SELECT * FROM vat");
}

function preloadVats()
{
    $vats = json_encode(getAllVats());
    return <<<JS
    vats = $vats;
    loadedVats();
JS;
}
