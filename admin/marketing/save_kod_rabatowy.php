<?php //route[{ADMIN}save_kod_rabatowy]

$posts = ["kod_id", "kod", "kwota", "user_id_list", "product_list", "date_from", "date_to", "ilosc", "type"];

foreach ($posts as $p) {
    if (!isset($_POST[$p]))
        die($p);

    $$p = $_POST[$p];
}

query("DELETE FROM kody_rabatowe WHERE kod_id = ?", [$kod_id]);

$kwota = round($kwota);

if (!isset($_POST["remove"])) {
    query(
        "INSERT INTO kody_rabatowe (kod, kwota, user_id_list, product_list, date_from, date_to, ilosc, type) VALUES (?,?,?,?,?,?,?,?)",
        [$kod, $kwota, $user_id_list, $product_list, $date_from ? $date_from : NULL, $date_to ? $date_to : NULL, $ilosc, $type]
    );
}
