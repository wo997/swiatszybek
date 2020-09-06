<?php //event[order_charged]

$zamowienie_data = $input["zamowienie_data"];


query("UPDATE zamowienia SET status_id = 1, oplacono = NOW() WHERE zamowienie_id = " . $zamowienie_data["zamowienie_id"]);

if (isset($input["info"])) {
    addZamowienieLog($zamowienie_data["zamowienie_id"], $input["info"]);
}

include "user/oplacono_mail.php";

sendEmail($email, $message, $mailTitle);
