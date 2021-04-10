<?php //route[{ADMIN}/general_product/variant/save]

try {
    DB::beginTransaction();
    $general_product_variant = EntityManager::getEntity("general_product_variant", json_decode($_POST["general_product_variant"], true));
    EntityManager::saveAll();
    DB::commitTransaction();
    Request::jsonResponse(["general_product_variant" => $general_product_variant->getSimpleProps()]);
} catch (Exception $e) {
    var_dump($e);
    DB::rollbackTransation();
}
