<?php //route[{ADMIN}save_zaawansowane]

saveSetting("general", "advanced", [
    "path" => [],
    "value" => json_decode($_POST["advanced"], true)
]);

reload();
