<?php //hook[migration]

DB::createTable("menu", [
    ["name" => "menu_id", "type" => "INT", "index" => "primary"],
    ["name" => "parent_menu_id", "type" => "INT", "index" => "index", "default" => "-1"],
    ["name" => "name", "type" => "VARCHAR(255)"],
    ["name" => "pos", "type" => "INT", "index" => "index"],
    ["name" => "__menu_path_json", "type" => "TEXT"],
]);
