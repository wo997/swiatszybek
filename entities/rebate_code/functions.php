<?php //hook[helper]

function getAllRebateCodes()
{
    return DB::fetchArr("SELECT * FROM rebate_code");
}

function preloadRebateCodes()
{
    $rebate_codes = json_encode(getAllRebateCodes());
    return <<<JS
    rebate_codes = $rebate_codes;
    loadedRebateCodes();
JS;
}
