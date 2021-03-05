<?php //route[/{ADMIN}rearrange_table]

if (!DB::tableExists($_POST["table"])) die;

rearrangeTable($_POST["table"], $_POST["primary"], $_POST["itemId"], $_POST["toIndex"], isset($_POST["params"]) ? json_decode($_POST["params"], true) : []);

triggerEvent("table_values_change", ["table" => $_POST["table"]]);
