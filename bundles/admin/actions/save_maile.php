<?php //route[{ADMIN}/save_emails]

saveSetting("general", "emails", [
    "path" => [],
    "value" => json_decode($_POST["emails"], true)
]);

Request::reload();
