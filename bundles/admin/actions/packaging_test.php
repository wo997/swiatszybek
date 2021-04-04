<?php //route[{ADMIN}/packaging_test]

$t = microtime(true);
// var_dump([putBoxIntoPackage(
//     [2, 6],
//     [
//         [1, 1],
//         [1, 1],
//         [1, 1],
//         [1, 1],
//         [1, 1],
//         //[1, 1],
//         [5, 3],
//         // [1, 1],
//         // [1, 1],
//         // [1, 1],
//         //[3, 5],
//         //[1, 3],
//         //[2, 10],
//     ]
// )]);
// var_dump([putBoxIntoPackage3D(
//     [6, 5, 3],
//     [
//         [1, 2, 4],
//         [1, 2, 3],
//         [1, 4, 1],
//         [1, 2, 2],
//         //[1, 2, 3],
//         //[1, 2, 2],
//     ]
// )]);

// works pretty well up to 4 items, reliable but not perfect ofc
// for 5 it's prety much always below 100
// for 4 is's below 5ms??? decent for sure
var_dump([putBoxIntoPackage3D(
    [60, 40, 30],
    [
        [10, 20, 60],
        [20, 20, 30],
        [15, 19, 39],
        [20, 40, 30],
        //[22, 50, 40],
        //[10, 25, 40],
        //[10, 55, 40],
    ]
)]);

var_dump([(microtime(true) - $t) * 1000 . " ms"]);


$x = [
    ["v" => 500, "i" => [144, 144, 145]],
    ["v" => 234, "i" => [6, 6, 9]],
    ["v" => 211, "i" => [10]],
    ["v" => 210, "i" => [5]],
];

// echo "<br><br>";
// setRangesFromLongDatasetWithIndices($x, 2);
// var_dump($x);
