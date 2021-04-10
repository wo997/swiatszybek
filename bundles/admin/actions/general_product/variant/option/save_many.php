<?php //route[{ADMIN}/general_product/variant/option/save_many]

try {
    DB::beginTransaction();
    $product_variant_options = [];
    foreach (json_decode($_POST["product_variant_options"], true) as $product_variant_option) {
        $product_variant_options[] = EntityManager::getEntity("product_variant_option", $product_variant_option)->getSimpleProps();
    }
    EntityManager::saveAll();
    DB::commitTransaction();
    Request::jsonResponse(["product_variant_options" => $product_variant_options]);
} catch (Exception $e) {
    var_dump($e);
    DB::rollbackTransation();
}
