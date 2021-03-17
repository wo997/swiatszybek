<?php //route[/product_queue/add]

try {
    DB::beginTransaction();
    $product_queue = EntityManager::getEntity("product_queue", json_decode($_POST["product_queue"], true));
    EntityManager::saveAll();
    DB::commitTransaction();
    Request::jsonResponse(["success" => true]);
} catch (Exception $e) {
    var_dump($e);
    DB::rollbackTransation();
}
