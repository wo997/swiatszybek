<?php //route[pies]

// the number 1 will act like cat type, rly silly but stick to it pls
$a = 1;

$a["age"]["value"] = "1"; // = "hehe";

$a["age"]["value"];

/*$b = 2;

if ($a > 0) {
    $b++;
}*/

$pies = [
    "sum" => function ($a, $b) {
        return $a + $b;
    },
];

var_dump($pies["sum"](1, 2));
