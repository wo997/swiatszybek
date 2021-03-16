<?php //route[/comment/search]  

$from =  "
    comment c
    LEFT JOIN user u USING(user_id)
    LEFT JOIN comment_to_product_feature_option ctpfo USING (comment_id)
    LEFT JOIN product_feature_option pfo USING (product_feature_option_id)
";

$where = "1";

if (isset($_POST["general_product_id"])) {
    $where .= " AND general_product_id = " . intval($_POST["general_product_id"]);
}

$query_counter = 0;
if (isset($_POST["options"])) {
    $options = json_decode($_POST["options"]);
    if ($options) {
        foreach ($options as $option_id) {
            $query_counter++;
            $where .= " AND ctpfo_$query_counter.product_feature_option_id = " . intval($option_id);
            $from .= " INNER JOIN comment_to_product_feature_option ctpfo_$query_counter USING (comment_id)";
        }
    }
}

$data = paginateData([
    "select" => "c.comment_id, c.comment, c.rating, u.nickname, c.created_at,
        JSON_ARRAYAGG(JSON_OBJECT('option_id', pfo.product_feature_option_id, 'value', pfo.value)) options_json",
    "from" => $from,
    "where" => $where,
    "order" => "comment_id DESC",
    "group" => "comment_id",
    "datatable_params" => $_POST["datatable_params"],
    "quick_search_fields" => ["c.comment"],
    "search_type" => "extended"
]);

foreach ($data["rows"] as $key => $row) {
    $data["rows"][$key]["created_at"] = dateDifference($row["created_at"]);
}

Request::jsonResponse($data);
