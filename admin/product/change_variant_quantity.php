<?php //->[admin/change_variant_quantity]

$input = ["variant_id" => $_POST["variant_id"], "quantity_difference" => $_POST["quantity_difference"]];
include "events/variant_quantity_change.php";

die;
