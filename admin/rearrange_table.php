<?php //->[admin/rearrange_table]

$table = clean($_POST["table"]);
$tableExists = fetchValue("show tables like '$table'");
if (!$tableExists) die;

rearrangeTable($table, $_POST["primary"],$_POST["itemId"],$_POST["toIndex"],isset($_POST["params"]) ? json_decode($_POST["params"],true) : []);

if ($table == "menu") {
    include "events/topmenu_change.php";
}