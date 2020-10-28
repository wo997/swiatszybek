<?php //route[{ADMIN}save_footer]

saveSetting("theme", "general", [
    "path" => ["page_footer"],
    "value" => $_POST["page_footer"]
]);

reload();
