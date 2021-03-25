<?php

function putBoxIntoPackage($package_dims, $products_dims, $contents = null)
{
    if (!$products_dims) {
        var_dump($contents);
        return true;
    }

    if ($contents === null) {
        // define contents as a set of points:
        // flow is always top or right
        //  ____________________
        // x                    |
        // o                    |
        // ooox                 |
        // |  o                 |
        // |  oooooooooox       |
        // |            o       |
        // |------------oooooooox

        $contents = [];
    }

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

    for ($product_index = 0; $product_index < count($products_dims); $product_index++) {
        $products_dims_copy = $products_dims;
        $product_to_put_dims = array_splice($products_dims_copy, $product_index, 1)[0];

        foreach ($orientations as $orientation) {
            $final_product_to_put_dims = [$product_to_put_dims[$orientation[0]], $product_to_put_dims[$orientation[1]]];

            $pos_count = count($contents);
            for ($pos_ind = 0; $pos_ind <= $pos_count; $pos_ind++) {

                $start_0 = $pos_ind === 0 ? 0 : $contents[$pos_ind - 1][0];
                $start_1 = $pos_ind === $pos_count ? 0 : $contents[$pos_ind][1];

                $end_0 = $start_0 + $final_product_to_put_dims[0];
                $end_1 = $start_1 + $final_product_to_put_dims[1];

                if ($end_0 > $package_dims[0] || $end_1 > $package_dims[1]) {
                    return false;
                }

                $new_pos = [$end_0, $end_1];
                $contents_copy = [];
                for ($pos_in_ind = 0; $pos_in_ind <= $pos_count; $pos_in_ind++) {
                    if ($pos_in_ind === $pos_ind) {
                        $contents_copy[] = $new_pos;
                    }
                    if ($pos_in_ind < $pos_count) {
                        $contents_copy[] = $contents[$pos_in_ind];
                    }
                }

                if (putBoxIntoPackage($package_dims, $products_dims_copy, $contents_copy)) {
                    return true;
                }
            }
        }
    }
}

// function getProductsFitInPackage($package_dims, $products_dims)
// {
//     $fits = true;

//     // $product_dims = $products_dims[0];

//     // if ($product_dims[0] >= $package_dims[0] || $product_dims[1] >= $package_dims[1]) {
//     //     $fits = false;
//     // }

//     putBoxIntoPackage($package_dims, $products_dims);

//     return $fits;
// }
