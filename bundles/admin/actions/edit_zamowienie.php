<?php //route[{ADMIN}/edit_zamowienie]

$link = $_POST["link"];

$log = "";

$zamowienie_id = intval(DB::fetchVal("SELECT zamowienie_id FROM zamowienia WHERE link = ?", [$link]));

include "helpers/safe_post.php";

foreach ($_POST as $k => $new) {
    if (strpos($k, "e_") !== 0) {
        continue;
    }

    $k = clean(substr($k, 2));

    $old = DB::fetchVal("SELECT $k FROM zamowienia WHERE zamowienie_id = $zamowienie_id");

    if ($old == $new) continue;

    if ($k != "notes") {
        $log .= "$k: $old => $new<br>";
    }

    DB::execute("UPDATE zamowienia SET $k = ? WHERE zamowienie_id = $zamowienie_id", [$new]);

    addZamowienieLog($zamowienie_id, $k, $old, $new);
}

header("Location: " . getZamowienieLink($link));
die;
