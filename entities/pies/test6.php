<?php //route[{ADMIN}testx]

try {
    DB::beginTransaction();

    $product_feature = EntityManager::getEntity("product_feature", [
        "product_feature_id" => 1,
        "name" => "aaab",
        "products" =>
        /** @var EntityProduct[] */
        [27, 15]
    ]);

    //var_dump(EntityManager::getEntities());

    $product_feature->saveToDB();

    /*$product = EntityManager::getEntity("product", [
        "gross_price" => "123",
        "name" => "aaa"

    ]);

    $product->saveToDB();*/
    DB::commitTransaction();
} catch (Exception $e) {
    var_dump($e);
    DB::rollbackTransation();
}
