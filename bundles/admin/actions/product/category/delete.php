<?php //route[{ADMIN}product/category/delete]

$id = Request::urlParam(4);

try {
    DB::beginTransaction();

    $product_category = EntityManager::getEntityById("product_category", $id);
    $product_category->setWillDelete();
    $product_category->saveToDB();

    DB::commitTransaction();
} catch (Exception $e) {
    var_dump($e);
    DB::rollbackTransation();
}
