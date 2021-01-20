<?php //event[order_basket_change]

$basket_data = DB::fetchArr("SELECT * FROM basket_content WHERE zamowienie_id = " . $args["zamowienie_id"]);
DB::execute("UPDATE zamowienia SET cache_basket = ? WHERE zamowienie_id = " . $args["zamowienie_id"], [
    json_encode($basket_data)
]);
