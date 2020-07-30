<?php //route[admin/save_kod_rabatowy]

$posts = ["kod_id", "kod", "kwota", "user_id_list", "product_id_list", "product_list_metadata", "date_from", "date_to", "ilosc", "type", "submit"];

foreach ($posts as $p) {
  if (!isset($_POST[$p]))
    die($p);

  $$p = $_POST[$p];
}

query("DELETE FROM kody_rabatowe WHERE kod_id = ?", [$kod_id]);

$kwota = round($kwota);

if ($submit == "save") {
  query(
    "INSERT INTO kody_rabatowe (kod, kwota, user_id_list, product_id_list, product_list_metadata, date_from, date_to, ilosc, type) VALUES (?,?,?,?,?,?,?,?,?)",
    [$kod, $kwota, $user_id_list, $product_id_list, $product_list_metadata, $date_from ? $date_from : NULL, $date_to ? $date_to : NULL, $ilosc, $type]
  );
}

header("Location: /admin/kody-rabatowe");
die;
