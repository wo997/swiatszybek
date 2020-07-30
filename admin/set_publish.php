<?php //route[admin/set_publish]

$table = clean($_POST["table"]);

$tableExists = fetchValue("show tables like '$table'");
if (!$tableExists) die;

query("UPDATE " . clean($_POST["table"]) . " SET published = " . intval($_POST["published"]) . " WHERE " . clean($_POST["primary"]) . " = " . intval($_POST["primary_id"]));

if ($table == "menu") {
    include "events/topmenu_change.php";
}
