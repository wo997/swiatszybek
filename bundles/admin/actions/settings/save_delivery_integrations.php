<?php //route[{ADMIN}/settings/save_delivery_integrations]  

saveSetting("general", "delivery_integrations", ["path" => [], "value" => json_decode($_POST["delivery_integrations"], true)]);
