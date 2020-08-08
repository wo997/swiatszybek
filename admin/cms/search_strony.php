<?php //route[admin/search_strony]

$where = "1";

if (isset($_POST['cms_id'])) {
  $where .= getListCondition("cms_id", $_POST['cms_id']);
}

$status = isset($_POST["status"]) ? $_POST["status"] : "";

if ($status != "") {
  if ($status == "published")
    $where .= " AND published";
}

echo getTableData([
  "select" => "cms_id, link, title, seo_title, seo_description, published",
  "from" => "cms c",
  "where" => $where,
  "order" => "c.cms_id DESC",
  "main_search_fields" => ["c.link", "c.title", "c.seo_description", "c.seo_title"],
]);
