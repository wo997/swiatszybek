<?php //hook[entity]

createTable("pies", [
    ["name" => "pies_id", "type" => "INT", "index" => "primary", "increment" => true],
    ["name" => "food", "type" => "INT"],
    ["name" => "food_double", "type" => "INT"],
    ["name" => "ate_at", "type" => "DATETIME", "index" => "index"],
    ["name" => "paws_json", "type" => "TEXT"],
]);

createTable("pies_paw", [
    ["name" => "pies_paw_id", "type" => "INT", "index" => "primary", "increment" => true],
    ["name" => "pies_id", "type" => "INT", "index" => "index"],
    ["name" => "name", "type" => "TINYTEXT"],
]);

// the plugin should be able to tell what these props are to type hint getProp and setProp
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
        "paws" => ["type" => "pies_paw[]"] // that's enough to tell the entity manager that piew_paw is its child
    ],
]);

Entity::register("pies_paw", [
    "props" => [
        "pies_id" => ["type" => "number"],
        "name" => ["type" => "string"],
    ],
]);

Entity::setter("pies", "food", function (EntityObject $obj, $val) {
    //$obj->setProp("food_double", 2 * $val);
    $obj->setProp("ate_at", date("Y-m-d.H:i:s"));
});

Entity::setter("pies", "food", function (EntityObject $obj, $val) {
    $obj->setProp("food_double", 2 * $val);
    //$obj->setProp("ate_at", date("Y-m-d.H:i:s"));
});

Entity::setter("pies", "paws", function (EntityObject $obj, $val) {
    // TODO: HEY! I have an idea, what if the plugin just added those type annotations? That's all we really need lol
    // won't make the code cleaner, but that's not the point
    // btw it will have to know the difference between an actual class or typedef, but once we have them listed that's not a big deal
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
