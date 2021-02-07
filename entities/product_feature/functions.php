<?php //hook[helper]

function getAllProductFeatures()
{
    return DB::fetchArr("SELECT product_feature_id, name FROM product_feature_option");
}
