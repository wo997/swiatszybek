<?php //route[pies]

/** @type {Cat} */
$a = fetchRow("SELECT * FROM cat");

$a["age"]["value"] = "1";

$a["name"] = "pieseł";

if ($a["name"]) {
    $a["name"] = "xxx";
}

var_dump(["age" => "pies", "age" => 123]);

function heyca($x, $y)
{
    /** @type {Cat} */
    $x = 666;
    $x["age"]["value"] = 5;
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
