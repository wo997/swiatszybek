<?php //hook[register]

EventListener::register("request_start", function () {
    if (Request::$url !== "/") {
        return;
    }
    $ref = def($_GET, "ref");
    if (!$ref) {
        return;
    }
    $link_from_user_id = DB::fetchVal("SELECT user_id FROM user WHERE __affiliate_program_code_url = ?", [$ref]);
    if ($link_from_user_id) {
        $different_link_or_first = $link_from_user_id !== def($_SESSION, "link_from_user_id");
        $_SESSION["link_from_user_id"] = $link_from_user_id;
        if ($different_link_or_first) {
            DB::insert("affiliate_program_event", [
                "user_id" => $link_from_user_id,
                "event_name" => "page_visit",
                "event_what_id" => null
            ]);
        }
    }
});
