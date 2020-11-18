<?php //event[order_basket_change]

$basket_data = fetchArray("SELECT * FROM basket_content WHERE zamowienie_id = " . $args["zamowienie_id"]);
query("UPDATE zamowienia SET cache_basket = ? WHERE zamowienie_id = " . $args["zamowienie_id"], [
    json_encode($basket_data)
]);
