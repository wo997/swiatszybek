<?php //hook[helper]

function getAllProductFeatureOptions()
{
    return DB::fetchArr("SELECT * FROM product_feature_option");
}


/**
 * getNamesFromOptionIds
 *
 * @param  number[] $option_ids
 * @return string[]
 */
function getNamesFromOptionIds($option_ids)
{
    if (!$option_ids) {
        return [];
    }
    $option_ids_csv = clean(join(",", $option_ids));
    return DB::fetchCol("SELECT name FROM product_feature_option WHERE product_feature_option_id IN ($option_ids_csv) ORDER BY FIELD(product_feature_option_id,$option_ids_csv)");
}
