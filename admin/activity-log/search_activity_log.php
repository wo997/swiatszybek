<?php //route[admin/search_activity_log]  

$where = "1";

if (isset($_POST['scope'])) {
  $where .= " AND scope = " . escapeSQL($_POST['scope']);
}
if (isset($_POST['scope_item_id'])) {
  $where .= " AND scope_item_id = " . intval($_POST['scope_item_id']);
}

echo paginateData([
  "select" => "CONCAT(imie, ' ', nazwisko, ' ', email) as user, logged_at, log",
  "from" => "activity_log a LEFT JOIN users u USING(user_id)",
  "where" => $where,
  "order" => "a.activity_id DESC",
  "main_search_fields" => ["imie", "nazwisko", "email", "log"],
]);
