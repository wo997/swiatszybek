<?php //route[{ADMIN}/general_product/variant/save]

try {
    DB::beginTransaction();
    $product_variant = EntityManager::getEntity("product_variant", json_decode($_POST["product_variant"], true));
    EntityManager::saveAll();
    DB::commitTransaction();
    Request::jsonResponse(["product_variant" => $product_variant->getSimpleProps()]);
} catch (Exception $e) {
    var_dump($e);
    DB::rollbackTransation();
}
