<?php //route[/{ADMIN}set_publish]

$table = clean($_POST["table"]);

$tableExists = DB::fetchVal("show tables like '$table'");
if (!$tableExists) die;

DB::execute("UPDATE " . clean($_POST["table"]) . " SET published = " . intval($_POST["published"]) . " WHERE " . clean($_POST["primary"]) . " = " . intval($_POST["primary_id"]));

triggerEvent("table_values_change", ["table" => $_POST["table"]]);
