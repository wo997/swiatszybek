<?php //hook[helper]

function getAllOrderStatuses()
{
    return DB::fetchArr("SELECT * FROM order_status");
}

function preloadOrderStatuses()
{
    $order_statuses = json_encode(getAllOrderStatuses());
    return <<<JS
    order_statuses = $order_statuses;
    loadedOrderStatuses();
JS;
}
