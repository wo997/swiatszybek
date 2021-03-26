<?php

function putBoxIntoPackage($package_dims, $products_dims, $contents = [] /*, $taken_space = 0*/)
{
    if (!$products_dims) {
        //var_dump($taken_space);
        var_dump($contents);

        return true;
    }

    // if ($contents === null) {
    //     // define contents as a set of points:
    //     // flow is always top or right
    //     //  ____________________
    //     // x                    |
    //     // o                    |
    //     // ooox                 |
    //     // |  o                 |
    //     // |  oooooooooox       |
    //     // |            o       |
    //     // |------------oooooooox

    //     $contents = [];
    // }

    // 3d
    // $orientations = [
    //     [0,1,2],
    //     [1,0,2],
    //     [0,2,1],
    //     [1,2,0],
    //     [2,0,1],
    //     [2,1,0],
    // ];

    // 2d
    $orientations = [
        [0, 1],
        [1, 0]
    ];

    $package_volume = $package_dims[0] * $package_dims[1];

    // take every product in every order - by recursion
    $top = count($products_dims);
    if (!$contents) {
        // at first level u got symmetry so there is no need to go beyond a half
        $top = $top / 2;
    }
    for ($product_index = 0; $product_index < $top; $product_index++) {
        $products_dims_copy = $products_dims;
        $product_to_put_dims = array_splice($products_dims_copy, $product_index, 1)[0];
        //$taken_space_copy = $taken_space + $product_to_put_dims[0] * $product_to_put_dims[1];
        foreach ($orientations as $orientation) {
            $final_product_to_put_dims = [$product_to_put_dims[$orientation[0]], $product_to_put_dims[$orientation[1]]];

            $pos_count = count($contents);
            //var_dump(">>>", count($contents));
            for ($pos_ind = 0; $pos_ind <= $pos_count; $pos_ind++) {
                $start = [
                    def($contents, [$pos_ind - 1, 0], 0),
                    def($contents, [$pos_ind, 1], 0),
                ];

                $end = [
                    $start[0] + $final_product_to_put_dims[0],
                    $start[1] + $final_product_to_put_dims[1]
                ];
                //var_dump(["start", $start, "end", $end]);
                if ($end[0] > $package_dims[0] || $end[1] > $package_dims[1]) {
                    //echo "x";
                    continue;
                }

                $contents_copy = [];
                for ($pos_in_ind = 0; $pos_in_ind <= $pos_count; $pos_in_ind++) {
                    if ($pos_in_ind === $pos_ind) {
                        $contents_copy[] = $end;
                    }
                    if (isset($contents[$pos_in_ind])) {
                        $was_pos = $contents[$pos_in_ind];

                        if ($was_pos[0] < $end[0] && $was_pos[1] < $end[1]) {
                            // unnecessary point
                        } else {
                            $contents_copy[] = $contents[$pos_in_ind];
                        }
                    }
                    // awful how the code below didnt work, somehow the length of contents changed
                    // if ($pos_in_ind < $pos_count) {
                    //     if (!isset($contents[$pos_in_ind])) {
                    //         var_dump("!!!", count($contents));
                    //         $was_pos = $contents[$pos_in_ind];

                    //         die;
                    //     }
                    //     $was_pos = $contents[$pos_in_ind];

                    //     if ($was_pos[0] < $end[0] && $was_pos[1] < $end[1]) {
                    //         // unnecessary point
                    //     } else {
                    //         $contents_copy[] = $contents[$pos_in_ind];
                    //     }
                    // }
                }

                // CALCULATING TAKEN ARE ACTUALLY MAKES IT SLOWER
                // is optimised?
                // $pos_count = count($contents_copy);
                // $area = 0;
                // for ($pos_in_ind = 0; $pos_in_ind < $pos_count; $pos_in_ind++) {
                //     $dx = $contents_copy[$pos_in_ind][0] - def($contents_copy, [$pos_in_ind - 1, 0], 0);
                //     $y = $contents_copy[$pos_in_ind][1];
                //     $area += $dx * $y;
                // }


                // if ($area > $package_volume) {
                //     //var_dump("LKSADFSADFDS", $area);
                //     continue;
                // }

                if (putBoxIntoPackage($package_dims, $products_dims_copy, $contents_copy /*, $taken_space_copy*/)) {
                    return true;
                }
            }
        }
    }

    return false;
}
