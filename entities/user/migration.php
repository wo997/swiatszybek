<?php //hook[migration]

DB::createTable("user", [
    ["name" => "user_id", "type" => "INT", "index" => "primary"],
    ["name" => "authenticated", "type" => "TINYINT(1)"],
    ["name" => "first_name", "type" => "VARCHAR(255)"],
    ["name" => "last_name", "type" => "VARCHAR(255)"],
    ["name" => "type", "type" => "VARCHAR(255)"],
    ["name" => "email", "type" => "VARCHAR(255)", "index" => "index"],
    ["name" => "login", "type" => "VARCHAR(255)", "index" => "index"],
    ["name" => "phone", "type" => "VARCHAR(255)"],
    ["name" => "password_hash", "type" => "VARCHAR(255)"],
    ["name" => "remember_me_token", "type" => "VARCHAR(255)"],
    ["name" => "visited_at", "type" => "DATETIME"],
    ["name" => "created_at", "type" => "DATETIME"],
    ["name" => "cart_json", "type" => "TEXT"],
    ["name" => "role_id", "previous_name" => "priveleges_id", "type" => "TINYINT"],
    //["name" => "last_active_at", "type" => "DATETIME"],
    ["name" => "nickname", "type" => "VARCHAR(255)"],
    ["name" => "__search", "type" => "VARCHAR(255)"],
]);
