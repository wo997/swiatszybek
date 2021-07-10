<?php //route[{ADMIN}/settings/save_company_info]  

saveSetting("general", "company", ["path" => [], "value" => json_decode($_POST["company_info"], true)]);
