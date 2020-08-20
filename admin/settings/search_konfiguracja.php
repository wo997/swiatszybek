<?php //route[admin/search_konfiguracja]  

orderTableBeforeListing("konfiguracja", "category");

$where = "1";

if (isset($_POST["category"])) {
  $where .= " AND category = " . escapeSQL($_POST["category"]);
}

echo getTableData([
  "select" => "prop_id, prop_name, prop_value, prop_name_nice, category",
  "from" => "konfiguracja k",
  "where" => $where,
  "order" => "k.kolejnosc ASC",
  "main_search_fields" => ["prop_name", "prop_value", "prop_name_nice"],
]);
