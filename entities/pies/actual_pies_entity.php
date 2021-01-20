<?php //hook[entity]

Entity::register("pies", [
    "props" => [
        "food" => ["type" => "number"],
        "food_double" => ["type" => "number"],
        "ate_at" => ["type" => "datetime"],
    ],
]);

// this can be a module yay
Entity::register("pies", [
    "props" => [
        "paws" => ["type" => "pies_paw[]"]
    ],
]);

Entity::register("pies_paw", [
    "props" => [
        "pies_id" => ["type" => "number"],
        "name" => ["type" => "string"],
    ],
    //"parent" => ["type" => "pies"] // entity manager understands that and assigns it for you :*
]);

EventListener::register("pies_set_food", function ($params) {
    /** @var EntityObject */
    $obj = $params["obj"];
    $val = $params["val"];

    //$obj->setProp("food_double", 2 * $val);
    $obj->setProp("ate_at", date("Y-m-d.H:i:s"));
});

EventListener::register("pies_set_food", function ($params) {
    /** @var EntityObject */
    $obj = $params["obj"];
    $val = $params["val"];

    $obj->setProp("food_double", 2 * $val);
    //$obj->setProp("ate_at", date("Y-m-d.H:i:s"));
});

EventListener::register("pies_set_paws", function ($params) {
    /** @var EntityObject */
    $obj = $params["obj"];

    /** @var EntityObject[] */
    $paws = $obj->getProp("paws");

    $paws_props = [];
    foreach ($paws as $paw) {
        if ($paw->getWillDelete()) {
            continue;
        }
        $paws_props[] = $paw->getRowProps();
    }
    $obj->setProp("paws_json", json_encode($paws_props));

    return $paws;
});
