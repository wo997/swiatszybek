<?php //hook[helper]

function getAllGeneralProductVariants()
{
    return DB::fetchArr("SELECT * FROM general_product_variant");
}

function preloadGeneralProductVariants()
{
    $general_product_variants = json_encode(getAllGeneralProductVariants());
    $general_product_variant_options = json_encode(getAllGeneralProductVariantOptions());
    return <<<JS
    general_product_variants = $general_product_variants;
    general_product_variant_options = $general_product_variant_options;
	loadedGeneralProductVariants();
JS;
}
