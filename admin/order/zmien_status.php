<?php //route[admin/zmien_status]

$urlParts = explode("/", $url);

$zamowienie_link = $urlParts[2];
$status = intval($urlParts[3]);

$case_oplacono = $status == 1 ? ", oplacono = NOW()" : "";
$case_wyslano = $status == 2 ? ", wyslano = NOW()" : "";
$case_odebrano = $status == 3 ? ", odebrano = NOW()" : "";

$zamowienie_data = fetchRow("SELECT * FROM zamowienia WHERE link = ?", [$zamowienie_link]);

/*$stmt = $con->prepare("SELECT imie, nazwisko, email, link, dostawa, status, basket, miejscowosc, kod_pocztowy, ulica, nr_domu, track, dostawa FROM zamowienia WHERE zamowienie_id = ?");
$stmt->bind_param("i", $zamowienie_data["zamowienie_id"]);
$stmt->execute();
$stmt->bind_result($zamowienie_data["imie"], $zamowienie_data["nazwisko"], $zamowienie_data["email"], $zamowienie_data["link"], $zamowienie_data["dostawa"], $was_status, $basket, $zamowienie_data["miejscowosc"], $zamowienie_data["kod_pocztowy"], $zamowienie_data["ulica"], $zamowienie_data["nr_domu"], $track, $zamowienie_data["dostawa"]);
mysqli_stmt_fetch($stmt);
$stmt->close();*/

query("UPDATE zamowienia SET status = ? $case_oplacono $case_wyslano $case_odebrano WHERE zamowienie_id = ?", [$status, $zamowienie_data["zamowienie_id"]]);

$oldStatusString = $statusList[$zamowienie_data["status"]]["title"];
$newStatusString = $statusList[$status]["title"];
addLogForZamowienie($zamowienie_data["zamowienie_id"], "Status: $oldStatusString => $newStatusString");
addZamowienieLog("Status: $oldStatusString ⇨ $newStatusString", $zamowienie_data["zamowienie_id"]);

// send mail

if ($status == 2) {
  $mailTitle = "Przekazano do wysyłki zamówienie #" . $zamowienie_data["zamowienie_id"] . " - " . config('main_email_sender') . "";

  $message = getEmailHeader($zamowienie_data);
  $message .= "Uprzejmie informujemy, że zamówienie <a href='" . getZamowienieLink($zamowienie_data["link"]) . "' style='font-weight:bold;color:#60c216;'>#" . $zamowienie_data["zamowienie_id"] . "</a> zostało spakowane oraz przekazane kurierowi.";
  if ($zamowienie_data["track"]) {
    $tracking_link = getTrackingLink($zamowienie_data["track"], $zamowienie_data["dostawa"], "");
    $message .= "<br><br>Możesz <b>śledzić przesyłkę</b> <a href='" . $tracking_link . "' style='font-weight:bold;color:#60c216;'>tutaj</a>";
  }
  $message .= getEmailFooter();
} else if ($status == 3) {
  $mailTitle = "Odebrano zamówienie #" . $zamowienie_data["zamowienie_id"] . " - " . config('main_email_sender') . "";

  $message = getEmailHeader($zamowienie_data);
  $message .= "Uprzejmie informujemy, że odebrałaś/eś <a href='" . getZamowienieLink($zamowienie_data["link"]) . "' style='font-weight:bold;color:#60c216;'>zamówienie #" . $zamowienie_data["zamowienie_id"] . "</a>.<br><br>";
  $message .= "Dziękujemy za zakupy i zapraszamy ponownie.";
  $message .= getEmailFooter();
} else if ($status == 4) {
  $mailTitle = "Anulowano zamówienie #" . $zamowienie_data["zamowienie_id"] . " - " . config('main_email_sender') . "";

  $message = getEmailHeader($zamowienie_data);
  $message .= "Uprzejmie informujemy, że anulowaliśmy <a href='" . getZamowienieLink($zamowienie_data["link"]) . "' style='font-weight:bold;color:#60c216;'>zamówienie #" . $zamowienie_data["zamowienie_id"] . "</a>.<br><br>";
  $message .= "Zapraszamy do dalszych zakupów";
  $message .= getEmailFooter();
} else if ($status == 0) {
  $mailTitle = "Zamówienie #" . $zamowienie_data["zamowienie_id"] . " oczekuje na opłatę - " . config('main_email_sender') . "";

  $message = getEmailHeader($zamowienie_data);
  $message .= "Uprzejmie informujemy, że Twoje zamówienie o numerze #" . $zamowienie_data["zamowienie_id"] . " oczekuje na opłatę.<br>";
  $message .= "Zapłać teraz klikając w <a href='" . getZamowienieLink($zamowienie_data["link"]) . "' style='font-weight:bold;color:#60c216;'>podany link</a>";
  $message .= getEmailFooter();
} else if ($status == 5) { // $zamowienie_data["dostawa"] == 'o'
  $mailTitle = "Zamówienie #" . $zamowienie_data["zamowienie_id"] . " oczekuje na odbiór - " . config('main_email_sender') . "";

  $message = getEmailHeader($zamowienie_data);
  $message .= "Uprzejmie informujemy, że Twoje <a href='" . getZamowienieLink($zamowienie_data["link"]) . "' style='font-weight:bold;color:#60c216;'>zamówienie #" . $zamowienie_data["zamowienie_id"] . "</a> oczekuje na odbiór <br>";
  $message .= $zamowienie_data["kod_pocztowy_dostawa"] . " " . $zamowienie_data["miejscowosc_dostawa"] . ", " . $zamowienie_data["ulica_dostawa"] . " " . $zamowienie_data["nr_domu_dostawa"] . ($zamowienie_data["nr_lokalu_dostawa"] ? "/" : "") . $zamowienie_data["nr_lokalu_dostawa"];
  $message .= getEmailFooter();
} else if ($status == 1) {
  query("UPDATE zamowienia SET oplacono = NOW() WHERE zamowienie_id = " . $zamowienie_data["zamowienie_id"]);
  include "oplacono_mail.php";
}

if (isset($mailTitle)) {
  sendEmail($zamowienie_data["email"], $message, $mailTitle);
  sendEmail(config('main_email'), $message, $mailTitle);
}

$add_subtract_stock = "";
if ($status == 4 && $zamowienie_data["status"] != 4) {
  $add_subtract_stock = "+";
}
if ($status != 4 && $zamowienie_data["status"] == 4) {
  $add_subtract_stock = "-";
}
if ($add_subtract_stock !== "") {
  $basket_swap = json_decode($zamowienie_data["basket"], true); // TODO: REWORK THAT
  $basket = [];
  foreach ($basket_swap as $b) {
    $stmt = $con->prepare("UPDATE variant SET stock = stock $add_subtract_stock " . intval($b['q']) . " WHERE variant_id = " . intval($b['v']));
    $stmt->execute();
    $stmt->close();
  }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  die;
}

header("Location: $SITE_URL/zamowienie/" . $zamowienie_data["link"] . "/$specificTime");
die;
