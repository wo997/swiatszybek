<?php //route[/comment/search]  

$data = paginateData([
    "select" => "c.comment_id, c.comment, c.rating, u.nickname, c.created_at, c.options_csv",
    "from" => "comment c LEFT JOIN user u USING(user_id)",
    "order" => "comment_id DESC",
    "datatable_params" => $_POST["datatable_params"]
]);

// REMEMBER TO USE FIND_IN_SET FOR SEARCHING

$option_ids = [];
foreach ($data["rows"] as $key => $row) {
    foreach (explode(",", $row["options_csv"]) as $option_id) {
        if ($option_id && !in_array($option_id, $option_ids)) {
            $option_ids[] = intval($option_id);
        }
    }
}

$options_data = DB::fetchArr("SELECT product_feature_option_id, value FROM product_feature_option WHERE product_feature_option_id IN (" . join(",", $option_ids) . ")");
$options_map = getAssociativeArray($options_data, "product_feature_option_id");

foreach ($data["rows"] as $key => $row) {
    $option_names = [];
    foreach (explode(",", $row["options_csv"]) as $option_id) {
        if (isset($options_map[$option_id])) {
            $option_names[] = $options_map[$option_id];
        }
    }

    $data["rows"][$key]["options_json"] = json_encode($option_names);
}

Request::jsonResponse($data);
