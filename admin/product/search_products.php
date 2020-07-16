<?php //->[admin/search_products]  

  $where = "1";

  /*$kategoria = isset($_POST["kategoria"]) ? $_POST["kategoria"] : "";

  if ($kategoria != "")
  {
    $category_id = intval($kategoria);
    $join = "INNER JOIN item_kategoria k ON i.product_id = k.product_id";
    $where .= " AND k.kategoria_id = '$category_id'";
  }*/

  $status = isset($_POST["status"]) ? $_POST["status"] : "";

  if ($status != "")
  {
    if ($status == "published")
        $where .= " AND published";
  }

  if (isset($_POST['product_id']))
  {
    $where .= getListCondition("product_id",$_POST['product_id']);
  }

  echo getTableData([
    "select" => "i.product_id, title, published, (SELECT sum(quantity) FROM variant v WHERE v.product_id = i.product_id) as amount",
    "from" => "products i",
    "where" => $where,
    "order" => "i.product_id DESC",
    "main_search_fields" => ["i.title"],
  ]);
?>
