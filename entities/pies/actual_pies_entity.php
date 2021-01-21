<?php //hook[entity]

// the plugin should be able to tell what these props are to type hint getProp and setProp
EntityManager::register("pies", [
    "props" => [
        "food" => ["type" => "number"],
        "food_double" => ["type" => "number"],
        "ate_at" => ["type" => "datetime"],
        "paws_json" => ["type" => "string"],
    ],
]);

// this can be a module yay
EntityManager::register("pies", [
    "props" => [
        "paws" => ["type" => "pies_paw[]"] // that's enough to tell the entity manager that pies_paw is its child
    ],
]);

EntityManager::register("pies_paw", [
    "props" => [
        "pies_id" => ["type" => "number"],
        "name" => ["type" => "string"],
    ],
]);

EntityManager::setter("pies", "food", function (Entity $obj, $val) {
    //$obj->setProp("food_double", 2 * $val);
    $obj->setProp("ate_at", date("Y-m-d.H:i:s"));
});

EntityManager::setter("pies", "food", function (Entity $obj, $val) {
    $obj->setProp("food_double", 2 * $val);
    //$obj->setProp("ate_at", date("Y-m-d.H:i:s"));
});

EntityManager::setter("pies", "paws", function (Entity $obj, $val) {

    // TODO: HEY! I have an idea, what if the plugin just added those type annotations? That's all we really need lol
    // won't make the code cleaner, but that's not the point
    // btw it will have to know the difference between an actual class or typedef, but once we have them listed that's not a big deal
    /** @var Entity[] */
    $paws = $obj->getProp("paws");

    $paws_props = [];
    foreach ($paws as $paw) {
        if ($paw->getWillDelete()) {
            continue;
        }
        $paws_props[] = $paw->getRowProps();
    }
    $obj->setProp("paws_json", json_encode($paws_props));
    //var_dump("XXXX", json_encode($paws));
    return $paws;
});

//var_dump(EntityManager::getEntityData("pies"));
//die;
