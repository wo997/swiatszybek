<?php //->[admin/rearrange_table]

if (!tableExists(clean($_POST["table"]))) die;

rearrangeTable($table, $_POST["primary"], $_POST["itemId"], $_POST["toIndex"], isset($_POST["params"]) ? json_decode($_POST["params"], true) : []);

if ($table == "menu") {
    include "events/topmenu_change.php";
}
