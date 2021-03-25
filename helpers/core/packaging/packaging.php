<?php

function putBoxIntoPackage($package_dims, $products_dims, $contents = [])
{
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
        $contents_copy = $contents;
        $product_to_put_dims = array_splice($products_dims_copy, $product_index, 1)[0];

        foreach ($orientations as $orientation) {
            $final_product_to_put_dims = [$product_to_put_dims[$orientation[0]], $product_to_put_dims[$orientation[1]]];
            var_dump($final_product_to_put_dims);
        }

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

        // fill the contents - all orientations and positions ofc

        //putBoxIntoPackage($package_dims, $products_dims_copy, $contents_copy);
    }
    //putBoxIntoPackage()

    //return 
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
