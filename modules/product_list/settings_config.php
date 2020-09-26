<?php //event[get_module_settings]

if ($input["module_name"] != "product_list") {
    return;
}

return [
    "product_list_count" => [
        "default" => "2137",
    ],
];
