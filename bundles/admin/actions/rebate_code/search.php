<?php //route[{ADMIN}/rebate_code/search]  

Request::jsonResponse(paginateData([
    "select" => "rebate_code_id, code, value, qty, available_from, available_till",
    "from" => "rebate_code",
    "order" => "rebate_code_id DESC",
    "quick_search_fields" => ["code", "value"],
    "datatable_params" => $_POST["datatable_params"]
]));
