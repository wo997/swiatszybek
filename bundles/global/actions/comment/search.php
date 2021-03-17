<?php //route[/comment/search]  

$options = json_decode(def($_POST, "options", "[]"));
$general_product_id = def($_POST, "general_product_id", "");

$data = getProductCommentsSearch($general_product_id, $_POST["datatable_params"], $options);

Request::jsonResponse($data);
