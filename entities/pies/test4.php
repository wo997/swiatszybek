<?php //route[{ADMIN}entity_test]

/*
createTable("pies", [
    ["name" => "pies_id", "type" => "INT", "index" => "primary", "increment" => true],
    ["name" => "food", "type" => "INT"],
    ["name" => "food_double", "type" => "INT"],
    ["name" => "ate_at", "type" => "DATETIME", "index" => "index"],
]);

createTable("pies_paw", [
    ["name" => "pies_paw_id", "type" => "INT", "index" => "primary", "increment" => true],
    ["name" => "pies_id", "type" => "INT", "index" => "index"],
    ["name" => "name", "type" => "TINYTEXT"],
]);
*/

// what about registering events like that? it would definitely work
EntityManager::registerEntity("pies", [
    "props" => [
        "food" => ["type" => "number"],
        "food_double" => ["type" => "number"],
        "ate_at" => ["type" => "datetime"],
    ],
]);

// this can be a module yay
EntityManager::registerEntity("pies", [
    "props" => [
        "paws" => ["type" => "pies_paw[]"]
    ],
]);

EntityManager::registerEntity("pies_paw", [
    "props" => [
        "pies_id" => ["type" => "number"],
        "name" => ["type" => "string"],
    ],
    //"parent" => ["type" => "pies"] // entity manager understands that and assigns it for you :*
]);

// var_dump(EntityManager::getEntityProps(("pies_paw")));
// die;


// imagine it's another file start
// function set__pies_pies_id(EntityObject $obj, $props) // if u don't add it it's completely fine!, it's assumed as default
// {
//     
// }
function set__pies_food(EntityObject $obj, $props)
{
    // other actions
    $obj->setProp("food_double", 2 * $props);
    $obj->setProp("ate_at", date("Y-m-d.H:i:s"));

    // modify value itself, what about errors tho?
    //return $props;
}
// what about append?

/*function set__pies_food_double(EntityObject $obj)
{
    
}*/

function set__pies_paws(EntityObject $obj, $props)
{
    /** @var EntityObject[] */
    $paws = $obj->getProp("paws"); //setManyToOneEntities($obj, "paws", "pies_paw", $props);

    $paws_props = [];
    foreach ($paws as $paw) {
        if ($paw->getWillDelete()) {
            continue;
        }
        $paws_props[] = $paw->getRowProps();
    }
    $obj->setProp("paws_json", json_encode($paws_props));

    return $paws;
}

// function get__pies_paws(EntityObject $obj)
// {
//     return getManyToOneEntities($obj, "pies_paw");
// }

// imagine it's another file end

$props = [
    "pies_id" => 20,
    "food" => 666,
    "unknown_field" => 12345,
    "paws" => [
        [
            "pies_paw_id" => 8, // change
            "name" => "changed name"
        ],
        [
            "pies_paw_id" => -1, // create
            "name" => "created"
        ],
    ]
];

// TODO: transactions :P
$pies = EntityManager::getFromProps("pies", $props);
$pies->saveToDB();

// $pies_paw_8 = EntityManager::getById("pies_paw", 8);
// $pies_paw_8->setWillDelete();
// $pies_paw_8->saveToDB();

//var_dump($pies_paw_8->getParent());

/** @var EntityObject[] */
//$pies_paws = $pies->getProp("paws");
//$pies_paws[1]->setWillDelete(); actually deletes pies_paw_8
//var_dump();

//if ($pies) {

//}

// $pies2 = EntityManager::getById("pies", 20);

// if ($pies2) {
//     $pies2->setProp("ate_at", date("Y-m-d.H:i:s", strtotime("-2 days")));
//     var_dump(["pies 2 paws: "], $pies2->getProp("paws"));
//     $pies2->saveToDB();
// }

//var_dump($pies, "\n\n\n", $pies2, "\n\n\n");
//var_dump($pies2);
