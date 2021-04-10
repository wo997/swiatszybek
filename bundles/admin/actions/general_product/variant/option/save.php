<?php //route[{ADMIN}/general_product/variant/option/save]

try {
    DB::beginTransaction();
    $product_variant_option = EntityManager::getEntity("product_variant_option", json_decode($_POST["product_variant_option"], true));
    EntityManager::saveAll();
    DB::commitTransaction();
    Request::jsonResponse(["product_variant_option" => $product_variant_option->getSimpleProps()]);
} catch (Exception $e) {
    var_dump($e);
    DB::rollbackTransation();
}
