<?php //event[order_charged]

$zamowienie_data = $input["zamowienie_data"];


query("UPDATE zamowienia SET status_id = 1, oplacono = NOW() WHERE zamowienie_id = " . $zamowienie_data["zamowienie_id"]);

if ($input["info"]) {
    addZamowienieLog($input["info"], $zamowienie_data["zamowienie_id"]);
}

include "user/oplacono_mail.php";

sendEmail($email, $message, $mailTitle);
