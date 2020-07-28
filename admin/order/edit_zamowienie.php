<?php //->[admin/edit_zamowienie]

$link = $_POST["link"];

$log = "";

$zamowienie_id = intval(fetchValue("SELECT zamowienie_id FROM zamowienia WHERE link = ?", [$link]));

include "helpers/safe_post.php";

foreach ($_POST as $k => $new) {
  if (strpos($k, "e_") !== 0) {
    continue;
  }

  $k = clean(substr($k, 2));

  $old = fetchValue("SELECT $k FROM zamowienia WHERE zamowienie_id = $zamowienie_id");

  if ($old == $new) continue;

  if ($k != "notes") {
    $log .= "$k: $old => $new<br>";
  }

  query("UPDATE zamowienia SET $k = ? WHERE zamowienie_id = $zamowienie_id", [$new]);

  addZamowienieLog("$k: $old ⇨ $new", $zamowienie_id);
}

if (strlen($log) > 5) {
  addLogForZamowienie($zamowienie_id, trim($log, "<br>"), $app["user"]["email"]);
}

header("Location: " . getZamowienieLink($link));
die;
