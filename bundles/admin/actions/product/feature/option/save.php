<?php //route[{ADMIN}/product/feature/option/save]

try {
    DB::beginTransaction();
    $product_feature_option = EntityManager::getEntity("product_feature_option", json_decode($_POST["product_feature_option"], true));
    //$product_feature_option->save();
    EntityManager::saveAll();
    // sortTable("product_feature_option"); // that's tricky actually, not sure if that would work, give it a try later
    DB::commitTransaction();
    Request::jsonResponse(["product_feature_option" => $product_feature_option->getSimpleProps()]);
} catch (Exception $e) {
    var_dump($e);
    DB::rollbackTransation();
}
