<?php

$mailTitle = "Opłacono zamówienie #".$zamowienie_data["zamowienie_id"]." - ".config('main_email_sender')."";

$message = getEmailHeader($zamowienie_data);
$message .= "Uprzejmie informujemy, że odnotowaliśmy wpłatę za zamówienie o numerze #".$zamowienie_data["zamowienie_id"].".<br>";
$message .= "Zobacz <a href='$SITE_URL/zamowienie/".getZamowienieLink($link)."' style='font-weight:bold;color:#60c216;'>szczegóły zamówienia</a> oraz śledź jego status.";
$message .= getEmailFooter();
