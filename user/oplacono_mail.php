<?php

$company_data = $app["company_data"];

$mailTitle = "Opłacono zamówienie #" . $zamowienie_data["zamowienie_id"] . " - " . $company_data["email_sender"] . "";

$message = getEmailHeader($zamowienie_data);
$message .= "Uprzejmie informujemy, że odnotowaliśmy wpłatę za zamówienie o numerze #" . $zamowienie_data["zamowienie_id"] . ".<br>";
$message .= "Zobacz <a href='" . getZamowienieLink($zamowienie_link) . "' style='font-weight:bold;color:" . primary_clr . ";'>szczegóły zamówienia</a> oraz śledź jego status.";
$message .= getEmailFooter();
