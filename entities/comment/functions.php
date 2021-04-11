<?php //hook[helper]

function getProductCommentsSearch($general_product_id, $datatable_params, $options = [])
{
    $from =  "
        comment c
        LEFT JOIN user u USING(user_id)
        LEFT JOIN comment_to_product_variant_option ctpvo USING (comment_id)
        LEFT JOIN product_variant_option pvo USING (product_variant_option_id)
    ";

    $where = "1";
    if ($general_product_id) {
        $general_product_id = intval($general_product_id);
        $where .= " AND c.general_product_id = $general_product_id";
    }

    $query_counter = 0;
    if (isset($_POST["options"])) {
        $options = json_decode($_POST["options"]);
        if ($options) {
            foreach ($options as $option_id) {
                $query_counter++;
                $where .= " AND ctpvo_$query_counter.product_variant_option_id = " . intval($option_id);
                $from .= " INNER JOIN comment_to_product_variant_option ctpvo_$query_counter USING (comment_id)";
            }
        }
    }

    $data = paginateData([
        "select" => "c.comment_id, c.comment, c.rating, u.nickname, c.created_at,
        JSON_ARRAYAGG(JSON_OBJECT('option_id', pvo.product_variant_option_id, 'name', pvo.name)) options_json",
        "from" => $from,
        "where" => $where,
        "order" => "comment_id DESC",
        "group" => "comment_id",
        "datatable_params" => $datatable_params,
        "quick_search_fields" => ["c.comment"],
        "search_type" => "extended"
    ]);

    foreach ($data["rows"] as $key => $row) {
        $data["rows"][$key]["created_at"] = dateDifference($row["created_at"]);
    }

    return $data;
}
