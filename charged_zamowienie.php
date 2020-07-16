<?php

// input $zamowienie_data

query("UPDATE zamowienia SET status = 1, oplacono = NOW() WHERE zamowienie_id = ".$zamowienie_data["zamowienie_id"]);

addLogForZamowienie($zamowienie_data["zamowienie_id"],"Opłacono przez Przelewy24 - ".$zamowienie_data["koszt"]." zł");
addZamowienieLog("Opłacono przez Przelewy24 - ".$zamowienie_data["koszt"]." zł",$zamowienie_data["zamowienie_id"]);

include "oplacono_mail.php";

sendEmail($email, $message, $mailTitle);