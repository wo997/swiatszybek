<?php //route[{ADMIN}search_products]  

$where = "1";

/*$kategoria = isset($_POST["kategoria"]) ? $_POST["kategoria"] : "";

  if ($kategoria != "")
  {
    $category_id = intval($kategoria);
    $join = "INNER JOIN item_kategoria k ON i.product_id = k.product_id";
    $where .= " AND k.kategoria_id = '$category_id'";
  }*/

$status = isset($_POST["status"]) ? $_POST["status"] : "";

if ($status != "") {
  if ($status == "published")
    $where .= " AND published";
}

echo paginateData([
  "select" => "p.product_id, title, p.published, sum(stock) as stock",
  "from" => "products p LEFT JOIN variant v USING(product_id)",
  "where" => $where,
  "group" => "p.product_id",
  "order" => "p.product_id DESC",
  "main_search_fields" => ["p.title"],
]);
