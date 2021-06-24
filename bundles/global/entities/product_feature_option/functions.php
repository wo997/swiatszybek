<?php //hook[helper]

function getAllProductFeatureOptions()
{
    return DB::fetchArr("SELECT * FROM product_feature_option");
}
