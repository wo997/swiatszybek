<?php //hook[entity]

EntityManager::register("carrier", [
    "props" => [
        "name" => ["type" => "string"],
        "delivery_type" => ["type" => "delivery_type"],
        "dimensions_json" => ["type" => "string"],
        "tracking_url_prefix" => ["type" => "string"],
        "delivery_time_days" => ["type" => "number"],
        "pos" => ["type" => "number"],
        "active" => ["type" => "number"],
        "api_key" => ["type" => "string"],
        "img_url" => ["type" => "string"],
        "__full_name" => ["type" => "string"],
    ],
]);

EventListener::register("before_save_carrier_entity", function ($params) {
    /** @var Entity Carrier */
    $carrier = $params["obj"];
    /** @var Entity DeliveryType */
    $delivery_type = $carrier->getProp("delivery_type");

    if ($delivery_type) {
        $carrier->setProp("__full_name", $delivery_type->getProp("name") . " " . $carrier->getProp("name"));
    }
});
