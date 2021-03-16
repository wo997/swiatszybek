<?php //route[/comment/search]  

$data = paginateData([
    "select" => "c.comment_id, c.comment, c.rating, u.nickname, c.created_at,
        JSON_ARRAYAGG(JSON_OBJECT('option_id', product_feature_option_id, 'value', value)) options_json",
    "from" => "
        comment c
        LEFT JOIN user u USING(user_id)
        LEFT JOIN comment_to_product_feature_option ctpfo USING (comment_id)
        LEFT JOIN product_feature_option pfo USING (product_feature_option_id)
    ",
    "order" => "comment_id DESC",
    "group" => "comment_id",
    "datatable_params" => $_POST["datatable_params"],

]);

foreach ($data["rows"] as $key => $row) {
    $data["rows"][$key]["created_at"] = dateDifference($row["created_at"]);
}


Request::jsonResponse($data);
