<?php //route[{ADMIN}/vat/search]  

Request::jsonResponse(paginateData([
    "select" => "v.vat_id, v.value, v.description",
    "from" => "vat v",
    "order" => "v.value DESC",
    "quick_search_fields" => ["v.value", "v.description"],
    "datatable_params" => $_POST["datatable_params"]
]));
