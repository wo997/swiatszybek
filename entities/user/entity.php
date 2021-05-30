<?php //hook[entity]

EntityManager::register("user", [
    "props" => [
        "authenticated" => ["type" => "number"],
        "name" => ["type" => "string"],
        "first_name" => ["type" => "string"],
        "last_name" => ["type" => "string"],
        "type" => ["type" => "string"],
        "email" => ["type" => "string"],
        "login" => ["type" => "string"],
        "phone" => ["type" => "string"],
        "password_hash" => ["type" => "string"],
        "remember_me_token" => ["type" => "string"],
        "visited_at" => ["type" => "string"],
        "created_at" => ["type" => "string"],
        "last_active_at" => ["type" => "string"],
        "cart_json" => ["type" => "string"],
        "last_viewed_products_json" => ["type" => "string"],
        "role_id" => ["type" => "number"],
        "nickname" => ["type" => "string"],
        "__search" => ["type" => "string"],
    ],
]);

EventListener::register("before_save_user_entity", function ($params) {
    /** @var Entity User */
    $user = $params["obj"];

    $search = "";
    $search .= " " . $user->getProp("first_name");
    $search .= " " . $user->getProp("last_name");
    $search .= " " . $user->getProp("email");
    $search .= " " . $user->getProp("phone");

    $search = getSearchableString($search);
    $user->setProp("__search", $search);
});
