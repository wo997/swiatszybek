<?php //route[commentAction]

$posts = ["comment_id", "action"];

foreach ($posts as $p) {
    if (!isset($_POST[$p]))
        die;
    $$p = $_POST[$p];
}

$product_id = DB::fetchVal("SELECT product_id FROM comments WHERE comment_id = ?", [$comment_id]);

if ($action == -1 && $app["user"]["id"]) {
    $condition = "";
    if (!$app["user"]["priveleges"]["backend_access"]) $condition .= " AND user_id = " . intval($app["user"]["id"]);
    DB::execute("DELETE FROM comments WHERE comment_id = ? $condition", [$comment_id]);
} else if ($app["user"]["priveleges"]["backend_access"]) {
    DB::execute("UPDATE comments SET accepted = 1 WHERE comment_id = ?", [$comment_id]);
}

triggerEvent("product_rating_change", ["product_id" => $product_id]);
