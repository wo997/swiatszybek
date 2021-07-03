<?php //hook[entity]

EntityManager::register("stock_product", [
    "props" => [
        "product" => ["type" => "product"],
        "net_price" => ["type" => "number"],
        "gross_price" => ["type" => "number"],
        "vat" => ["type" => "number"], // been bought with that VAT
        "dimension_qty" => ["type" => "number"],
        // ugh? for gabaryt we sell pieces, I think we could do the split
        // and still keep these "parts" in the stock but assign their shop_order_ids accordingly
        // no ! only sold products have shop order id? XD
        //"shop_order" => ["type" => "shop_order"],
        "delivered_at" => ["type" => "string"],
        // "sold_at" => ["type" => "string"], // we do not need anything that ain't here? lol, will be in transation!
        // "returned_at" => ["type" => "string"],
    ],
]);

EntityManager::oneToOne("stock_product", "product", "product");
