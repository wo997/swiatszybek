<?php //route[{ADMIN}/packaging_test]

$t = microtime(true);
var_dump([putBoxIntoPackage(
    [2, 6],
    [
        [1, 1],
        [1, 1],
        [1, 1],
        [1, 1],
        [1, 1],
        //[1, 1],
        [5, 3],
        // [1, 1],
        // [1, 1],
        // [1, 1],
        //[3, 5],
        //[1, 3],
        //[2, 10],
    ]
)]);
// var_dump([putBoxIntoPackage3D(
//     [2, 3, 4],
//     [
//         [1, 2, 3],
//     ]
// )]);

var_dump([(microtime(true) - $t) * 1000 . " ms"]);
