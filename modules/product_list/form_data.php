<?php //event[get_module_form_data]

if ($input["module_name"] != "product_list") {
    return;
}

return triggerEvent("get_module_settings", $input);
