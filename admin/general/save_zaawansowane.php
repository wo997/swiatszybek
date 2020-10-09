<?php //route[admin/save_zaawansowane]

saveSetting("general", "advanced", [
    "path" => [],
    "value" => json_decode($_POST["advanced"], true)
]);

reload();
