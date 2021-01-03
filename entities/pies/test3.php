<?php //route[pies]

/**
 * @typedef GridData {
 * x_coords: number some description
 * y_coords: number yet another description
 * }
 */

/**
 * @typedef Cat {
 * age: CatAge this is the age of a cat
 * name: string is the name of a cat
 * }
 */

/**
 * @typedef CatAge {
 * value: number actual age value
 * }
 */

echo "x";

$u = fetchRow("SELECT cat_id, mother, children_json js, pies as piesekx FROM cat");
//$u["js"]

/** @type {Cat[]} */
$cats = [];
foreach ($cats as $cat) {
    echo $cat["name"];
    $cat["age"]["value"];
}

/** @type {Cat} */
$a = fetchRow("SELECT cat_id, mother, children_json js, pies as piesekx FROM cat");

$a["age"]["value"] = "1";

$a["name"] = "pieseł";

$a["name"] = 69;

$counter = 0;
while ($a["name"] < $a["age"]["value"]) {
    $number = 123;

    if ($a["name"]) {
        $a["name"] = "xxx";
    }
}

echo $a["name"];

var_dump([
    "age" => [
        "value" => 444
    ],
    "age" => 123,
    "age" => [
        "value" => 123
    ],
    "age" => [
        "value" => 455
    ],
    "name" => "hey",
    "age" => ["value"]
]);

function heyca($x, $y)
{
    /**
     * @typedef GridData {
     * some_prop: string
     * }
     */

    /** @type {Cat} */
    $x = 666;
    $x["age"]["value"] = 5;
}

class TestClass
{
    /** @param {Cat} $cat */
    public function pies($cat)
    {
        echo $cat[""];

        /** @type {Cat} */
        $x = 666;
        $x["age"]["value"] = 5;
    }
}
 
//var_dump(["name"]);

/*$b = 2;

if ($a > 0) {
    $b++;
}*/ 


/*$pies = [
    "sum" => function ($a, $b) { 
        return $a + $b;
    },
];

var_dump($pies["sum"](1, 2));*/
