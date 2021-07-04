<?php //route[{ADMIN}/product/save]

try {
    DB::beginTransaction();
    $product = EntityManager::getEntity("product", json_decode($_POST["product"], true));
    EntityManager::saveAll();
    DB::commitTransaction();
    Request::jsonResponse($product->getSimpleProps());
} catch (Exception $e) {
    var_dump($e);
    DB::rollbackTransation();
}
