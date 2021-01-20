<?php //route[{ADMIN}search_activity_log]  

$where = "1";

if (isset($_POST['scope'])) {
    $where .= " AND scope = " . DB::escape($_POST['scope']);
}
if (isset($_POST['scope_item_id'])) {
    $where .= " AND scope_item_id = " . intval($_POST['scope_item_id']);
}

echo paginateData([
    "select" => "imie, nazwisko, email, logged_at, log, previous_state, current_state",
    "from" => "activity_log a LEFT JOIN users u USING(user_id)",
    "where" => $where,
    "order" => "a.activity_id DESC",
    "main_search_fields" => ["imie", "nazwisko", "email", "log"],
]);
