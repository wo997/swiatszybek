<?php //route[admin/delete_product]

$urlParts = explode("/", $url);

$product_id = intval($urlParts[2]);

$stmt = $con->prepare("DELETE FROM products WHERE product_id = $product_id");
$stmt->execute();
$stmt->close();

$stmt = $con->prepare("DELETE FROM variant WHERE product_id = $product_id");
$stmt->execute();
$stmt->close();

header("Location: /admin/produkty/$specificTime");
die;
