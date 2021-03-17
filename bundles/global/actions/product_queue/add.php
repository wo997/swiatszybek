<?php //route[/product_queue/add]

try {
    $product_queue_data = json_decode($_POST["product_queue"], true);

    $product_queue_data["email"] = trim($product_queue_data["email"]);
    if (DB::fetchVal("SELECT 1 FROM product_queue WHERE email LIKE ?", [$product_queue_data["email"]])) {
        Request::jsonResponse(["success" => true]);
        // alrady added but dont say it lol
        //Request::jsonResponse(["success" => false, "message" => ""]);
    }

    DB::beginTransaction();
    $product_queue = EntityManager::getEntity("product_queue", $product_queue_data);
    EntityManager::saveAll();
    DB::commitTransaction();
    Request::jsonResponse(["success" => true]);
} catch (Exception $e) {
    var_dump($e);
    DB::rollbackTransation();
}
