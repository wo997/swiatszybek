<?php //route[{ADMIN}save_dane_firmy]

saveSetting("general", "company", [
    "path" => [],
    "value" => json_decode($_POST["company"], true)
]);

reload();
