<?php //hook[migration]

DB::createTable("menu", [
    ["name" => "menu_id", "type" => "INT", "index" => "primary"],
    ["name" => "parent_menu_id", "type" => "INT", "index" => "index", "default" => "-1"],
    ["name" => "name", "type" => "VARCHAR(255)"],
    ["name" => "pos", "type" => "INT", "index" => "index"],
    ["name" => "link_what", "type" => "VARCHAR(255)", "index" => "index"],
    ["name" => "link_what_id", "type" => "INT", "index" => "index", "null" => true],
    ["name" => "url", "type" => "VARCHAR(255)", "index" => "index", "null" => true],
]);
