<?php //route[{ADMIN}save_zaawansowane]

saveSetting("general", "advanced", [
    "path" => [],
    "value" => json_decode($_POST["advanced"], true)
]);

// consider queuing handling it at the end of the request
triggerEvent("settings_change");

reload();
