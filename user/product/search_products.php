<?php //route[search_products]

$module_block_data = getModuleBlockData(
    "product_list",
    json_decode(nonull($_POST, "product_filters", "{}"), true)
);

json_response(
    [
        "content" => $module_block_data["content"],
        "pageCount" => $module_block_data["data"]["products"]["pageCount"],
        "totalRows" => $module_block_data["data"]["products"]["totalRows"],
        "price_info" => $module_block_data["data"]["price_info"],
    ]
);
