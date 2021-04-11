<?php //hook[helper]

function getAllProductFeatureOptions()
{
    return DB::fetchArr("SELECT * FROM product_feature_option");
}

/**
 * getValuesFromOptionIds
 *
 * @param  number[] $option_ids
 * @return string[]
 */
function getValuesFromOptionIds($option_ids)
{
    if (!$option_ids) {
        return [];
    }
    $option_ids_csv = clean(join(",", $option_ids));
    return DB::fetchCol("SELECT name FROM product_variant_option WHERE product_variant_option_id IN ($option_ids_csv) ORDER BY FIELD(product_variant_option_id,$option_ids_csv)");
}
