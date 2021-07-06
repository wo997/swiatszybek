<?php //route[{ADMIN}/transaction/search]  

$select = "t.transaction_id, t.gross_price, t.created_at, t.paid_at, t.__products_json";
$where = "1";
$from = "transaction t";

$datatable_params = json_decode($_POST["datatable_params"], true);
$is_expense = def($datatable_params, "is_expense", null);
if ($is_expense !== null) {
    $is_expense = intval($is_expense);
    $where .= " AND is_expense = $is_expense";
    if ($is_expense) {
        $from .= " LEFT JOIN address sa ON sa.address_id = t.seller_id";
        $select .= ", sa.__display_name seller_display_name, sa.nip seller_nip";
    } else {
        $from .= " LEFT JOIN address ba ON ba.address_id = t.buyer_id";
        $select .= ", ba.__display_name buyer_display_name, ba.nip buyer_nip";
    }
}

Request::jsonResponse(paginateData([
    "select" => $select,
    "from" => $from,
    "where" => $where,
    "order" => "transaction_id DESC",
    "quick_search_fields" => ["t.__search"],
    "datatable_params" => $_POST["datatable_params"]
]));

// "buyer" => ["type" => "address"],
//         "seller" => ["type" => "address"],
//         "is_expense" => ["type" => "number"],
//         "created_at" => ["type" => "string"],
//         "paid_at" => ["type" => "string"],
//         "net_price" => ["type" => "number"],
//         "gross_price" => ["type" => "number"],
//         "__products_json" => ["type" => "string"],
//         "__products_search" => ["type" => "string"],
//         "__search" => ["type" => "string"],