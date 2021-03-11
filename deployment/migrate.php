<?php

echo "<br><h3>Running all migrations:</h3>";

DB::createTable("page", [
    ["name" => "page_id", "type" => "INT", "index" => "primary"],
    ["name" => "url", "type" => "TINYTEXT"], // I think we should index that field ezy
    ["name" => "seo_title", "type" => "TINYTEXT"],
    ["name" => "seo_description", "type" => "TINYTEXT"],
    ["name" => "html_content", "type" => "MEDIUMTEXT"],
    ["name" => "settings_json", "type" => "MEDIUMTEXT"],
    ["name" => "published", "type" => "TINYINT(1)"],
]);

DB::createTable("authentication_token", [
    ["name" => "authentication_token_id", "type" => "INT", "index" => "primary"],
    ["name" => "token", "type" => "VARCHAR(255)", "index" => "index"],
    ["name" => "action", "type" => "VARCHAR(255)"],
    ["name" => "valid_untill", "type" => "DATETIME"],
]);


// DB::createTable("page", [
//     ["name" => "page_id", "type" => "INT", "index" => "primary"],
//     ["name" => "url", "type" => "TINYTEXT"], // I think we should index that field ezy
//     ["name" => "seo_title", "type" => "TINYTEXT"],
//     ["name" => "seo_description", "type" => "TINYTEXT"],
//     ["name" => "html_content", "type" => "MEDIUMTEXT"],
//     ["name" => "settings_json", "type" => "MEDIUMTEXT"],
//     ["name" => "published", "type" => "TINYINT(1)"],
// ]);

@include BUILDS_PATH . "hooks/migration.php";

echo "<h3>✅ All migrations completed</h3>";
