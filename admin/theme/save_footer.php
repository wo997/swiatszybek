<?php //route[admin/save_footer]

saveSetting("theme", "layout", [
    "path" => ["page_footer"],
    "value" => $_POST["page_footer"]
]);

reload();
