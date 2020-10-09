<?php //route[admin/save_dane_firmy]

saveSetting("general", "company", [
    "path" => [],
    "value" => json_decode($_POST["company"], true)
]);

reload();
