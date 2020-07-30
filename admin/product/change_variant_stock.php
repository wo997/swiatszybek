<?php //route[admin/change_variant_stock]

$input = ["variant_id" => $_POST["variant_id"], "stock_difference" => $_POST["stock_difference"]];
include "events/variant_stock_change.php";

die;
