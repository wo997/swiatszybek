<?php //hook[entity]

EntityManager::register("user", [
    "props" => [
        "affiliate_program_code" => ["type" => "string"],
        "__affiliate_program_code_url" => ["type" => "string"],
    ],
]);

EntityManager::register("affiliate_program_event", [
    "props" => [
        "user_id" => ["type" => "number"],
        "event_name" => ["type" => "string"],
        "event_what_id" => ["type" => "number"],
        "added_at" => ["type" => "number"],
    ],
]);

EventListener::register("before_save_user_entity", function ($params) {
    /** @var Entity User */
    $user = $params["obj"];

    $affiliate_program_code = $user->getProp("affiliate_program_code");
    $user->setProp("__affiliate_program_code_url", $affiliate_program_code ? escapeUrl($affiliate_program_code) : null);
});
