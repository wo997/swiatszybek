<?php //route[commentAction]

$posts = ["comment_id", "action"];

foreach ($posts as $p) {
  if (!isset($_POST[$p]))
    die;
  $$p = $_POST[$p];
}

$product_id = fetchValue("SELECT product_id FROM comments WHERE comment_id = ?", [$comment_id]);

if ($action == -1 && $app["user"]["id"]) {
  $condition = "";
  if (!$app["user"]["is_admin"]) $condition .= " AND user_id = " . intval($app["user"]["id"]);
  query("DELETE FROM comments WHERE comment_id = ? $condition", [$comment_id]);
} else if ($app["user"]["is_admin"]) {
  query("UPDATE comments SET accepted = 1 WHERE comment_id = ?", [$comment_id]);
}

triggerEvent("product_rating_change", ["product_id" => $product_id]);
