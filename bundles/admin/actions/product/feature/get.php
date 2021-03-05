<?php //route[/{ADMIN}product/feature/get]

$id = Request::urlParam(4);

$product_feature = EntityManager::getEntityById("product_feature", $id);

Request::jsonResponse(["product_feature" => $product_feature->getAllProps()]);
