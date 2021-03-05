<?php //route[/{ADMIN}user/search]  

Request::jsonResponse(paginateData([
    "select" => "user_id, first_name, last_name, email", //, published",
    "from" => "user",
    "order" => "user_id ASC",
    "quick_search_fields" => ["first_name", "last_name", "email"],
    "datatable_params" => $_POST["datatable_params"]
]));

// ["name" => "user_id", "type" => "INT", "index" => "primary"],
// ["name" => "authenticated", "type" => "TINYINT(1)"],
// ["name" => "first_name", "type" => "VARCHAR(255)"],
// ["name" => "last_name", "type" => "VARCHAR(255)"],
// ["name" => "type", "type" => "VARCHAR(255)"],
// ["name" => "email", "type" => "VARCHAR(255)", "index" => "index"],
// ["name" => "login", "type" => "VARCHAR(255)", "index" => "index"],
// ["name" => "phone", "type" => "VARCHAR(255)"],
// ["name" => "password_hash", "type" => "VARCHAR(255)"],
// ["name" => "remember_me_token", "type" => "VARCHAR(255)"],
// ["name" => "visited_at", "type" => "DATETIME"],
// ["name" => "created_at", "type" => "DATETIME"],
// ["name" => "cart_json", "type" => "TEXT"],
// ["name" => "cart_json", "type" => "TEXT"],
// ["name" => "privelege_id", "type" => "TINYINT"],
// //["name" => "last_active_at", "type" => "DATETIME"],