<?php //route[{ADMIN}zmien_status]

$urlParts = explode("/", $url);

$zamowienie_link = $urlParts[2];
$new_status_id = intval($urlParts[3]);

$case_oplacono = $new_status_id == 1 ? ", oplacono = NOW()" : "";
$case_wyslano = $new_status_id == 2 ? ", wyslano = NOW()" : "";
$case_odebrano = $new_status_id == 3 ? ", odebrano = NOW()" : "";

$zamowienie_data = fetchRow("SELECT * FROM zamowienia WHERE link = ?", [$zamowienie_link]);

/*$stmt = $con->prepare("SELECT imie, nazwisko, email, link, dostawa, status_id, basket, miejscowosc, kod_pocztowy, ulica, nr_domu, track, dostawa FROM zamowienia WHERE zamowienie_id = ?");
$stmt->bind_param("i", $zamowienie_data["zamowienie_id"]);
$stmt->execute();
$stmt->bind_result($zamowienie_data["imie"], $zamowienie_data["nazwisko"], $zamowienie_data["email"], $zamowienie_data["link"], $zamowienie_data["dostawa"], $was_status_id, $basket, $zamowienie_data["miejscowosc"], $zamowienie_data["kod_pocztowy"], $zamowienie_data["ulica"], $zamowienie_data["nr_domu"], $track, $zamowienie_data["dostawa"]);
mysqli_stmt_fetch($stmt);
$stmt->close();*/

query("UPDATE zamowienia SET status_id = ? $case_oplacono $case_wyslano $case_odebrano WHERE zamowienie_id = ?", [$new_status_id, $zamowienie_data["zamowienie_id"]]);

$oldStatusString = getRowById($status_list, $zamowienie_data["status_id"])["title"];
$newStatusString = getRowById($status_list, $new_status_id)["title"];
addZamowienieLog($zamowienie_data["zamowienie_id"], "Status", $oldStatusString, $newStatusString);

// send mail

$company_data = getSetting("general", "company", [], "");

if ($new_status_id == 2) {
  $mailTitle = "Przekazano do wysyłki zamówienie #" . $zamowienie_data["zamowienie_id"] . " - " . $company_data['email_sender'] . "";

  $message = getEmailHeader($zamowienie_data);
  $message .= "Uprzejmie informujemy, że zamówienie <a href='" . getZamowienieLink($zamowienie_data["link"]) . "' style='font-weight:bold;color:" . primary_clr . ";'>#" . $zamowienie_data["zamowienie_id"] . "</a> zostało spakowane oraz przekazane kurierowi.";
  if ($zamowienie_data["track"]) {
    $tracking_link = getTrackingLink($zamowienie_data["track"], $zamowienie_data["dostawa"], "");
    $message .= "<br><br>Możesz <b>śledzić przesyłkę</b> <a href='" . $tracking_link . "' style='font-weight:bold;color:" . primary_clr . ";'>tutaj</a>";
  }
  $message .= getEmailFooter();
} else if ($new_status_id == 3) {
  $mailTitle = "Odebrano zamówienie #" . $zamowienie_data["zamowienie_id"] . " - " . $company_data['email_sender'] . "";

  $message = getEmailHeader($zamowienie_data);
  $message .= "Uprzejmie informujemy, że odebrałaś/eś <a href='" . getZamowienieLink($zamowienie_data["link"]) . "' style='font-weight:bold;color:" . primary_clr . ";'>zamówienie #" . $zamowienie_data["zamowienie_id"] . "</a>.<br><br>";
  $message .= "Dziękujemy za zakupy i zapraszamy ponownie.";
  $message .= getEmailFooter();
} else if ($new_status_id == 4) {
  $mailTitle = "Anulowano zamówienie #" . $zamowienie_data["zamowienie_id"] . " - " . $company_data['email_sender'] . "";

  $message = getEmailHeader($zamowienie_data);
  $message .= "Uprzejmie informujemy, że anulowaliśmy <a href='" . getZamowienieLink($zamowienie_data["link"]) . "' style='font-weight:bold;color:" . primary_clr . ";'>zamówienie #" . $zamowienie_data["zamowienie_id"] . "</a>.<br><br>";
  $message .= "Zapraszamy do dalszych zakupów";
  $message .= getEmailFooter();
} else if ($new_status_id == 0) {
  $mailTitle = "Zamówienie #" . $zamowienie_data["zamowienie_id"] . " oczekuje na opłatę - " . $company_data['email_sender'] . "";

  $message = getEmailHeader($zamowienie_data);
  $message .= "Uprzejmie informujemy, że Twoje zamówienie o numerze #" . $zamowienie_data["zamowienie_id"] . " oczekuje na opłatę.<br>";
  $message .= "Zapłać teraz klikając w <a href='" . getZamowienieLink($zamowienie_data["link"]) . "' style='font-weight:bold;color:" . primary_clr . ";'>podany link</a>";
  $message .= getEmailFooter();
} else if ($new_status_id == 5) { // $zamowienie_data["dostawa"] == 'o'
  $mailTitle = "Zamówienie #" . $zamowienie_data["zamowienie_id"] . " oczekuje na odbiór - " . $company_data['email_sender'] . "";

  $message = getEmailHeader($zamowienie_data);
  $message .= "Uprzejmie informujemy, że Twoje <a href='" . getZamowienieLink($zamowienie_data["link"]) . "' style='font-weight:bold;color:" . primary_clr . ";'>zamówienie #" . $zamowienie_data["zamowienie_id"] . "</a> oczekuje na odbiór <br>";
  $message .= $zamowienie_data["kod_pocztowy_dostawa"] . " " . $zamowienie_data["miejscowosc_dostawa"] . ", " . $zamowienie_data["ulica_dostawa"] . " " . $zamowienie_data["nr_domu_dostawa"] . ($zamowienie_data["nr_lokalu_dostawa"] ? "/" : "") . $zamowienie_data["nr_lokalu_dostawa"];
  $message .= getEmailFooter();
} else if ($new_status_id == 1) {
  query("UPDATE zamowienia SET oplacono = NOW() WHERE zamowienie_id = " . $zamowienie_data["zamowienie_id"]);
  include "user/oplacono_mail.php";
}

if (isset($mailTitle)) {
  /*@sendEmail($zamowienie_data["email"], $message, $mailTitle);
  foreach (getOrderEmailList() as $email) {
    @sendEmail($email, $message, $mailTitle);
  }*/
}

/*$add_subtract_stock = "";
if ($new_status_id == 4 && $zamowienie_data["status_id"] != 4) {
  $add_subtract_stock = "+";
}
if ($new_status_id != 4 && $zamowienie_data["status_id"] == 4) {
  $add_subtract_stock = "-";
}
if ($add_subtract_stock !== "") {
  $basket_swap = json_decode($zamowienie_data["basket"], true); // TODO: REWORK THAT
  $basket = [];
  foreach ($basket_swap as $b) {
    query("UPDATE variant SET stock = stock $add_subtract_stock " . intval($b['q']) . " WHERE variant_id = " . intval($b['v']));
  }
}*/

if (IS_XHR) {
  json_response([
    "zamowienie_data" => $zamowienie_data,
    "new_status_id" => $new_status_id,
  ]);

  die;
}

header("Location: " . SITE_URL . "/zamowienie/" . $zamowienie_data["link"]);
die;
