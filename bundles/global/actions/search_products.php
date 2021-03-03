<?php //route[search_products]

$module_block_data = getModuleBlockData(
    "product_list",
    json_decode(def($_POST, "product_filters", "{}"), true)
);

Request::jsonResponse(
    [
        "content" => $module_block_data["content"],
        "total_rows" => $module_block_data["data"]["products"]["total_rows"],
        "price_info" => $module_block_data["data"]["price_info"],
    ]
);
