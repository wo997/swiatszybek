<?php //hook[entity]

EntityManager::register("transaction", [
    "props" => [
        "buyer" => ["type" => "address"],
        "seller" => ["type" => "address"],
        "is_expense" => ["type" => "number"],
        "created_at" => ["type" => "string"],
        "paid_at" => ["type" => "string"],
        "net_price" => ["type" => "number"],
        "gross_price" => ["type" => "number"],
        "__products_json" => ["type" => "string"],
        "__products_search" => ["type" => "string"],
        "__search" => ["type" => "string"],
    ],
]);

EntityManager::oneToOne("transaction", "buyer", "address");

EntityManager::oneToOne("transaction", "seller", "address");

EventListener::register("before_save_transaction_entity", function ($params) {
    /** @var Entity Transaction */
    $transaction = $params["obj"];
    $transaction_id = $transaction->getId();

    /** @var Entity[] TransactionProduct */
    $transaction_products = $transaction->getProp("transaction_products");

    $__products_search = "";
    $__products = [];
    foreach ($transaction_products as $transaction_product) {
        $__products_search .= " " . $transaction_product->getProp("name");
        $__products[] = [
            "name" => $transaction_product->getProp("name"),
            "qty" => $transaction_product->getProp("qty")
        ];
    }

    $is_expense = $transaction->getProp("is_expense");

    $search = $__products_search;
    if ($is_expense) {
        /** @var Entity Address */
        $seller = $transaction->getProp("seller");
        if ($seller) {
            $search .= " " . $seller->getProp("__display_name");
        }
    } else {
        /** @var Entity Address */
        $buyer = $transaction->getProp("buyer");
        if ($buyer) {
            $buyer .= " " . $buyer->getProp("__display_name");
        }
    }

    $transaction->setProp("__products_search", getSearchableString($__products_search));
    $transaction->setProp("__products_json", json_encode($__products));
    $transaction->setProp("__search", getSearchableString($search));
});
