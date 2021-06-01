<?php //hook[entity]

EntityManager::register("rebate_code", [
    "props" => [
        "code" => ["type" => "string"],
        "value" => ["type" => "string"],
        "qty" => ["type" => "string"],
        "available_from" => ["type" => "string"],
        "available_till" => ["type" => "string"],
        "general_products_json" => ["type" => "string"],
        "users_json" => ["type" => "string"],
    ],
]);

EventListener::register("set_rebate_code_entity_code", function ($params) {
    $val = $params["val"];
    return strtoupper($val);
});

EventListener::register("set_rebate_code_entity_value", function ($params) {
    $val = $params["val"];
    if (strpos($val, "%") !== false) {
        if (floatval(str_replace("%", "", $val)) > 100) {
            return 0;
        }
    }
    if ($val < 0) {
        return 0;
    }
});
