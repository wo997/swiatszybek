<?php //route[{ADMIN}/stock_product/save_many]

try {
    DB::beginTransaction();
    foreach (json_decode($_POST["stock_products"], true) as $stock_product) {
        EntityManager::getEntity("stock_product", $stock_product);
    }
    EntityManager::saveAll();
    DB::commitTransaction();
    Request::jsonResponse(["success" => true]);
} catch (Exception $e) {
    var_dump($e);
    DB::rollbackTransation();
}
