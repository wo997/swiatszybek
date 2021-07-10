<?php //route[{ADMIN}/settings/save_payments]  

saveSetting("general", "payments", ["path" => [], "value" => json_decode($_POST["payments"], true)]);
