<?php //route[{ADMIN}save_new_cms]

saveSetting("general", "random", [
    "path" => [],
    "value" => json_decode($_POST["random"], true)
]);

reload();
