<?php //->[admin/search_strony]
  

  $where = "1";

  // interesting but useful?
  /*foreach($res as &$r) {
    foreach ($r as &$v) {
      $v = htmlspecialchars($v);
    }
  }*/

  if (isset($_POST['cms_id']))
  {
    $where .= getListCondition("cms_id",$_POST['cms_id']);
  }

  $status = isset($_POST["status"]) ? $_POST["status"] : "";

  if ($status != "")
  {
    if ($status == "published")
        $where .= " AND published";
  }

  echo getTableData([
    "select" => "cms_id, link, title, meta_description, published",
    "from" => "cms c",
    "where" => $where,
    "order" => "c.cms_id DESC",
    "main_search_fields" => ["c.link","c.title","c.meta_description"],
  ]);
?>
