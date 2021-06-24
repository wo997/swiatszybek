<?php //hook[helper]

function getAllDeliveryTypes()
{
    return DB::fetchArr("SELECT * FROM delivery_type");
}

function preloadDeliveryTypes()
{
    $delivery_types = json_encode(getAllDeliveryTypes());
    return <<<JS
    delivery_types = $delivery_types;
    loadedDeliveryTypes();
JS;
}
