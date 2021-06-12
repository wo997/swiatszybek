<?php //route[{ADMIN}/template/search]  

Request::jsonResponse(paginateData([
    "select" => "t.template_id, t.name, t.created_at, t.modified_at, t.page_type, t.pos, t.is_global, t.parent_template_id",
    "from" => "template t",
    "order" => "t.template_id DESC",
    "quick_search_fields" => ["t.name"],
    "where" => "",
    "datatable_params" => $_POST["datatable_params"]
]));
