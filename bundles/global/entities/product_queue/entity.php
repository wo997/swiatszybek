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

    if ($product->getProp("stock") > 0) {
        $url = $product->getProp("__url");
        $name = $product->getProp("__name");
        $img = $product->getProp("__img_url");
        $mailTitle = "$name jest już dostępny w sklepie!";

        $message = "<p>Uprzejmie informujemy, że <b>$name</b> jest dostępny w naszym sklepie!</p>";
        $message .= "<a href=\"$url\" style='color:#37f;font-weight:bold;font-size:16px'>Kup teraz</a><br><br>";
        $message .= $img;
        $message .= getEmailFooter();

        foreach ($product_queues as $product_queue) {
            if ($product_queue->getProp("email_sent_at") !== null) {
                continue;
            }

            $email = $product_queue->getProp("email");
            $product_queue->setProp("email_sent_at", date("Y-m-d H:i:s"));
            sendEmail($email, $message, $mailTitle);
        }
    }
});
