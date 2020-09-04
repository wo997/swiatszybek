<?php //route[search_comments]
$status = isset($_POST["status"]) ? $_POST["status"] : "";

$product_id = isset($_POST['product_id']) ? " AND product_id = " . intval($_POST['product_id']) : "";

$canSee = "";
if ($app["user"]["id"] && !$app["user"]["priveleges"]["backend_access"]) $canSee = "AND (user_id = " . $app["user"]["id"] . " OR accepted = 1)";

$where = "1 $product_id $canSee";

if ($status == "n")
  $where .= " AND accepted = 0";

echo paginateData([
  "select" => "dodano, pseudonim, tresc, user_id, comment_id, rating, accepted, product_id, title, link",
  "from" => "comments c LEFT JOIN products i using(product_id)",
  "where" => $where,
  "order" => "comment_id DESC",
  "main_search_fields" => ["c.pseudonim", "c.tresc", "i.title"],
  "renderers" => [
    "rating" => function ($row) {
      return ratingBlock($row["rating"]);
    },
    "link" => function ($row) {
      return getProductLink($row["product_id"], $row["link"]);
    },
    "dodano" => function ($row) {
      return dateDifference($row["dodano"]);
    }
  ]
]);
