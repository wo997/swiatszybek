<?php //hook[helper]

function getAllGeneralProductVariantOptions()
{
    return DB::fetchArr("SELECT * FROM general_product_variant_option");
}
