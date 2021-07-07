<?php //hook[migration]

DB::createTable("stock_product", [
    ["name" => "stock_product_id", "type" => "INT", "index" => "primary"],
    ["name" => "product_id", "type" => "INT", "index" => "index"],
    ["name" => "net_price", "type" => "DECIMAL(10,2)"],
    ["name" => "gross_price", "type" => "DECIMAL(10,2)", "index" => "index"],
    ["name" => "vat", "type" => "DECIMAL(10,2)"],
    ["name" => "dimension_qty", "type" => "INT"], // TODO: decimal? double? well, we need a precision ugh
    ["name" => "sale_id", "type" => "INT", "index" => "index", "null" => true],
    ["name" => "added_at", "type" => "DATETIME", "default" => "CURRENT_TIMESTAMP"],
]);
