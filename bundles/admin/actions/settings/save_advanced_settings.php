<?php //route[{ADMIN}/settings/save_advanced_settings]  

saveSetting("general", "advanced", ["path" => [], "value" => json_decode($_POST["advanced_settings"], true)]);
