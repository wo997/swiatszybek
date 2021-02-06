<?php //route[{ADMIN}product/attribute/save]

try {
    DB::beginTransaction();

    $product_feature = EntityManager::getEntity("product_feature", json_decode($_POST["product_feature"], true));

    $product_feature->saveToDB();

    DB::commitTransaction();
} catch (Exception $e) {
    var_dump($e);
    DB::rollbackTransation();
}
