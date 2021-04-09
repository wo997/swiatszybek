<?php //route[{ADMIN}/general_product/save]

try {
    DB::beginTransaction();
    foreach (json_decode(def($_POST, "product_feature_options", "[]"), true) as $product_feature_option_data) {
        EntityManager::getEntity("product_feature_option", $product_feature_option_data);
    }
    $general_product = EntityManager::getEntity("general_product", json_decode($_POST["general_product"], true));
    EntityManager::saveAll();
    DB::commitTransaction();
    Request::jsonResponse(["general_product_id" => $general_product->getId()]);
} catch (Exception $e) {
    var_dump($e);
    DB::rollbackTransation();
}
