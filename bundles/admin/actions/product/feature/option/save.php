<?php //route[{ADMIN}/product/feature/option/save]

try {
    DB::beginTransaction();
    $product_feature_option = EntityManager::getEntity("product_feature_option", json_decode($_POST["product_feature_option"], true));
    EntityManager::saveAll();
    DB::commitTransaction();
    Request::jsonResponse(["product_feature_option" => $product_feature_option->getSimpleProps()]);
} catch (Exception $e) {
    var_dump($e);
    DB::rollbackTransation();
}
