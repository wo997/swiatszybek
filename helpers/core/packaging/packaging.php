<?php

function putBoxIntoPackage($package_dims, $products_dims, $contents = [])
{
    if (!$products_dims) {
        var_dump($contents);

        return true;
    }

    // 2d
    $orientations = [
        [0, 1],
        [1, 0]
    ];

    $top = count($products_dims);
    if (!$contents) {
        // at first level u got symmetry so there is no need to go beyond a half
        $top = $top / 2;
    }
    // take every product in every order - by recursion
    for ($product_index = 0; $product_index < $top; $product_index++) {
        $products_dims_copy = $products_dims;
        $product_to_put_dims = array_splice($products_dims_copy, $product_index, 1)[0];
        foreach ($orientations as $orientation) {
            $final_product_to_put_dims = [$product_to_put_dims[$orientation[0]], $product_to_put_dims[$orientation[1]]];

            if (!$contents) {
                $starts = [
                    [0, 0]
                ];
            } else {
                $starts = [];
                foreach ($contents as $two_points_1) {
                    array_push(
                        $starts,
                        [
                            $two_points_1[0][0],
                            $two_points_1[1][1],
                        ],
                        [
                            $two_points_1[1][0],
                            $two_points_1[0][1],
                        ]
                    );
                }
            }

            foreach ($starts as $start) {
                $end = [
                    $start[0] + $final_product_to_put_dims[0],
                    $start[1] + $final_product_to_put_dims[1]
                ];
                //var_dump(["start", $start, "end", $end]);
                if ($end[0] > $package_dims[0] || $end[1] > $package_dims[1]) {
                    continue;
                }

                foreach ($contents as $two_points_2) {
                    if ($start[0] < $two_points_2[1][0] && $start[1] < $two_points_2[1][1]) {
                        break 2;
                    }
                }

                $contents_copy = [
                    [$start, $end]
                ];

                foreach ($contents as $two_points_2) {
                    if ($two_points_2[1][0] >= $end[0] || $two_points_2[1][1] >= $end[1]) {
                        $contents_copy[] = $two_points_2;
                    }
                }

                if (putBoxIntoPackage($package_dims, $products_dims_copy, $contents_copy)) {
                    return true;
                }
            }
        }
    }
    return false;
}

function putBoxIntoPackage3D($package_dims, $products_dims, $contents = [])
{
    if (!$products_dims) {
        var_dump([$contents]);

        return true;
    }

    // 3d
    $orientations = [
        [0, 1, 2],
        [1, 0, 2],
        [0, 2, 1],
        [1, 2, 0],
        [2, 0, 1],
        [2, 1, 0],
    ];

    $top = count($products_dims);
    if (!$contents) {
        // at first level u got symmetry so there is no need to go beyond a half
        $top = $top / 2;
    }
    // take every product in every order - by recursion
    for ($product_index = 0; $product_index < $top; $product_index++) {
        $products_dims_copy = $products_dims;
        $product_to_put_dims = array_splice($products_dims_copy, $product_index, 1)[0];
        foreach ($orientations as $orientation) {
            $final_product_to_put_dims = [
                $product_to_put_dims[$orientation[0]],
                $product_to_put_dims[$orientation[1]],
                $product_to_put_dims[$orientation[2]],
            ];

            if (!$contents) {
                $starts = [
                    [0, 0, 0]
                ];
            } else {
                $starts = [];
                foreach ($contents as $two_points_1) {
                    array_push(
                        $starts,
                        [
                            $two_points_1[1][0],
                            $two_points_1[0][1],
                            $two_points_1[0][2],
                        ],
                        [
                            $two_points_1[0][0],
                            $two_points_1[1][1],
                            $two_points_1[0][2],
                        ],
                        [
                            $two_points_1[0][0],
                            $two_points_1[0][1],
                            $two_points_1[1][2],
                        ],
                    );
                }
            }

            foreach ($starts as $start) {
                $end = [
                    $start[0] + $final_product_to_put_dims[0],
                    $start[1] + $final_product_to_put_dims[1],
                    $start[2] + $final_product_to_put_dims[2],
                ];
                //var_dump(["start", $start, "end", $end]);
                if ($end[0] > $package_dims[0] || $end[1] > $package_dims[1] || $end[2] > $package_dims[2]) {
                    continue;
                }

                foreach ($contents as $two_points_2) {
                    if ($start[0] < $two_points_2[1][0] && $start[1] < $two_points_2[1][1] && $start[2] < $two_points_2[1][2]) {
                        break 2;
                    }
                }

                $contents_copy = [
                    [$start, $end]
                ];
                //var_dump(["AAA", $contents_copy]);


                foreach ($contents as $two_points_2) {
                    if ($two_points_2[1][0] >= $end[0] || $two_points_2[1][1] >= $end[1] || $two_points_2[1][2] >= $end[2]) {
                        //var_dump("XXX", $two_points_2);
                        $contents_copy[] = $two_points_2;
                    }
                }

                if (putBoxIntoPackage3D($package_dims, $products_dims_copy, $contents_copy)) {
                    return true;
                }
            }
        }
    }
    return false;
}
