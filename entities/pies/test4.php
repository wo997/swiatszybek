<?php //route[{ADMIN}entity_test]


// $color = EntityManager::getFromProps("color", [
//     "name" => "blue"
// ]);
// $color->saveToDB();


$props = [
    "pies_id" => 20,
    "food" => 666,
    "unknown_field" => 12345,
    "paws" => [
        [
            "paw_of_pies_id" => 8, // change
            "name" => "changed namex"
        ],
        [
            "paw_of_pies_id" => -1, // create
            "name" => "createdx"
        ],
    ],
    "colors" => [
        [
            "color_id" => 1, // change
            "name" => "changed name"
        ],
        [
            "color_id" => -1, // create
            "name" => "created"
        ],
    ]
];

$pies = EntityManager::getFromProps("pies", $props);
$pies->saveToDB();


//EntityManager::clearObjects();
//var_dump(EntityManager::$objects);

// example of warming up data, u might ask - when should I do it? when some table/column does not exist and you suppose the data aint ready yet
// just create a hook and place it in a single file right after u modify the table, you need a simple rule to say it
// you can even select a single record and tell if it's ok or not
// foreach (DB::fetchCol("select pies_id from pies") as $id) {
//     $pies = EntityManager::getById("pies", $id);
//     $pies->setProp("paws");
//     $pies->saveToDB();
// }

// memory test - it's totally fine, there might be no room for improvement
// $piess = [];
// for ($i = 0; $i < 10; $i++) {
//     $pies = EntityManager::getFromProps("pies", $props);
//     $piess[] = $pies;
//     $pies->saveToDB();
//     var_dump([$i, memory_get_usage()]);
// }

// /**
//  * u
//  *
//  * @return number
//  */
// function u()
// {
//     return 1;
// }

// /**
//  * u
//  *
//  * @return number
//  */
// function z()
// {
//     return "this function is so darn good that it will know we return a string hah";
// }

// $paw_of_pies_8 = EntityManager::getById("paw_of_pies", 8);
// $paw_of_pies_8->setWillDelete();
// $paw_of_pies_8->saveToDB();

// $b = 5;
// $b = "asd";

// $a = new Entity($name, $props);
// $b = "9";
// $b = $a->getId();

// $c = (((new Entity($name, $props))))->getId();

// $p = z();
//$b = u();

// works
// DB::beginTransaction();
// DB::execute("update pies set food = food + 1 WHERE pies_id = 1");
// //DB::commitTransaction();
// DB::rollbackTransation();

//var_dump($paw_of_pies_8->getParent());

///** @var Entity[] */
//$paw_of_piess = $pies->getProp("paws");
//$paw_of_piess[1]->setWillDelete(); actually deletes paw_of_pies_8
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
