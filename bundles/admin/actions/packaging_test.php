<?php //route[{ADMIN}/packaging_test]

$t = microtime(true);
var_dump([putBoxIntoPackage(
    [2, 6],
    [
        [1, 1],
        [1, 1],
        [1, 1],
        // [1, 1],
        // [1, 1],
        [1, 1],
        [5, 3],
        // [1, 1],
        // [1, 1],
        // [1, 1],
        // [1, 1],
        // [1, 1],
        // [1, 1],
        //[3, 5],
        //[1, 3],
        //[2, 10],
        //[2, 1],
        //[1, 1],
        //[3, 2],
    ]
)]);
var_dump([(microtime(true) - $t) * 1000 . " ms"]);
