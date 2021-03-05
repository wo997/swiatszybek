<?php //route[{ADMIN}/general_product/save]

try {
    DB::beginTransaction();
    $general_product = EntityManager::getEntity("general_product", json_decode($_POST["general_product"], true));
    //$general_product->save();
    //var_dump(EntityManager::getObjects());
    //var_dump($general_product->getProp("products"));
    //die;
    EntityManager::saveAll();
    DB::commitTransaction();

    Request::jsonResponse(["general_product_id" => $general_product->getId()]);
} catch (Exception $e) {
    var_dump($e);
    DB::rollbackTransation();
}
