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
$pies = Entity::getFromProps("pies", $props);
$pies->saveToDB();

// $pies_paw_8 = Entity::getById("pies_paw", 8);
// $pies_paw_8->setWillDelete();
// $pies_paw_8->saveToDB();

//var_dump($pies_paw_8->getParent());

///** @var EntityObject[] */
//$pies_paws = $pies->getProp("paws");
//$pies_paws[1]->setWillDelete(); actually deletes pies_paw_8
//var_dump();

//if ($pies) {

//}

// $pies2 = Entity::getById("pies", 20);

// if ($pies2) {
//     $pies2->setProp("ate_at", date("Y-m-d.H:i:s", strtotime("-2 days")));
//     var_dump(["pies 2 paws: "], $pies2->getProp("paws"));
//     $pies2->saveToDB();
// }

//var_dump($pies, "\n\n\n", $pies2, "\n\n\n");
//var_dump($pies2);
