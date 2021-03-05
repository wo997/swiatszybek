<?php //route[/{ADMIN}change_variant_stock]

triggerEvent("variant_stock_change", ["variant_id" => $_POST["variant_id"], "stock_difference" => $_POST["stock_difference"]]);
die;
