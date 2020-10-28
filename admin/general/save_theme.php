<?php //route[{ADMIN}save_theme]

saveSetting("theme", "general", [
    "path" => [],
    "value" => json_decode($_POST["data"], true)
]);

triggerEvent("theme_change");

reload();
