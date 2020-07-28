<?php

$can_user_get_comment_rebate = false;

if ($app["user"]["id"]) {
    $sql = "
        SELECT zamowienie_id, imie, nazwisko FROM basket_content INNER JOIN zamowienia USING (zamowienie_id)
        WHERE user_id = {$app["user"]["id"]}
        AND status IN (2,3)
        AND product_id = " . $input["product_id"] . "
        AND rebate_generated = 0
        GROUP BY product_id
        LIMIT 1
    ";

    $can_user_get_comment_rebate = fetchRow($sql);
}
