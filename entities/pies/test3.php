<?php //route[pies]

/** @type {Cat} */
$a = fetchRow("SELECT * FROM cat");

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

// function heyca($x, $y)
// {
//     /** @type {Cat} */
//     $x = 666;
//     $x["age"]["value"] = 5;
// }
 
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
