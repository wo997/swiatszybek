<?php

$can_user_get_comment_rebate = false;

if ($app["user"]["id"]) {
    $sql = "
        SELECT zamowienie_id, imie, nazwisko FROM zamowienia
        WHERE user_id = {$app["user"]["id"]}
        AND status IN (2,3)
        AND (basket LIKE '%\"i\":".$input["product_id"]."}%' OR basket LIKE '%\"i\":".$input["product_id"].",%')
        AND rebate_generated = 0 LIMIT 1
    ";
    $can_user_get_comment_rebate = fetchRow($sql);
}