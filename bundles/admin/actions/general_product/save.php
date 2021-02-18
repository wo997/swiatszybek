<?php //route[{ADMIN}general_product/save]

try {
    DB::beginTransaction();

    $general_product = EntityManager::getEntity("general_product", json_decode($_POST["general_product"], true));
    $general_product->saveToDB();

    var_dump($general_product);
    DB::commitTransaction();
} catch (Exception $e) {
    var_dump($e);
    DB::rollbackTransation();
}
