<?php //route[admin/set_basket_variant_purchase_price]
query("UPDATE basket_content SET purchase_price = ? WHERE basket_item_id = " . intval($_POST["basket_item_id"]), [$_POST["purchase_price"]]);

$zamowienie_id = fetchValue("SELECT zamowienie_id FROM basket_content WHERE basket_item_id = " . intval($_POST["basket_item_id"]));

$input = ["zamowienie_id" => $zamowienie_id];
include "events/basket_change.php";
