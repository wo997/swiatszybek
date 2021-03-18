<?php //hook[entity]

EntityManager::register("product_queue", [
    "props" => [
        "product_id" => ["type" => "number"],
        "email" => ["type" => "string"],
        "submitted_at" => ["type" => "string"],
        "email_sent_at" => ["type" => "string"],
    ],
]);

EntityManager::register("product", [
    "props" => [
        "product_queues" => ["type" => "product_queue[]"],
        "__queue_count" => ["type" => "number"],
    ],
]);

EntityManager::oneToMany("product", "product_queues", "product_queue");

EventListener::register("before_save_product_entity", function ($params) {
    /** @var Entity Product */
    $product = $params["obj"];
    /** @var Entity[] ProductQueue */
    $product_queues = $product->getProp("product_queues");

    $product->setProp("__queue_count", count($product_queues));
});
