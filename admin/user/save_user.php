<?php //route[admin/save_user]

$user_id = nonull($_POST, "user_id", "-1");
if ($user_id == "-1") {
    query("INSERT INTO users () VALUES ()");
    $user_id = getLastInsertedId();
} else {
    $user_id = intval($_POST["user_id"]);
}

$password_hash = password_hash($_POST["password"], PASSWORD_BCRYPT, ['cost' => 12]);
$authentication_token = bin2hex(random_bytes(10));

query("UPDATE users SET imie = ?, nazwisko = ?, telefon = ?, password_hash = ?, authentication_token = ? WHERE user_id = " . intval($user_data["user_id"]), [
    $_POST["imie"], $_POST["nazwisko"], $_POST["telefon"], $password_hash, $authentication_token
]);
// query(
//     "INSERT INTO zamowienia (
//           user_id, link, koszt, zlozono, status,
//           imie, nazwisko, email, telefon, firma, nip,
//           dostawa, paczkomat, oddzial_id,
//           kraj, miejscowosc, kod_pocztowy, ulica, nr_domu, nr_lokalu,
//           kraj_dostawa, miejscowosc_dostawa, kod_pocztowy_dostawa, ulica_dostawa, nr_domu_dostawa, nr_lokalu_dostawa,
//           uwagi, koszt_dostawy, buyer_type, session_id, forma_zaplaty, 
//           rabat_wartosc, rabat_type, rabat_kod
//         )
      
//         VALUES (
//           ?,CONCAT((SELECT * FROM (SELECT IF(ISNULL(MAX(zamowienie_id)),1,MAX(zamowienie_id)+1) FROM zamowienia) as x),'-',?),?,?,?,?,
//           ?,?,?,?,?,
//           ?,?,?,
//           ?,?,?,?,?,?,
//           ?,?,?,?,?,?,
//           ?,?,?,?,?,
//           ?,?,?
//         )",
//     [
//         $user_id, $link_hash, $koszt, date("Y-m-d H:i:s"), 0,
//         $_POST["imie"], $_POST["nazwisko"], $_POST["email"], $_POST["telefon"], $_POST["firma"], $_POST["nip"],
//         $_POST["dostawa"], $paczkomat, $oddzial_id,
//         $_POST["kraj"], $_POST["miejscowosc"], $_POST["kod_pocztowy"], $_POST["ulica"], $_POST["nr_domu"], $_POST["nr_lokalu"],
//         $_POST["kraj_dostawa"], $_POST["miejscowosc_dostawa"], $_POST["kod_pocztowy_dostawa"], $_POST["ulica_dostawa"], $_POST["nr_domu_dostawa"], $_POST["nr_lokalu_dostawa"],
//         $_POST["uwagi"], $koszt_dostawy, $_POST["buyer_type"], $session_id, $_POST["forma_zaplaty"],
//         $kod_rabatowy_wartosc, $kod_rabatowy_type, $kod_rabatowy
//     ]
// );
    //     query("UPDATE users SET name = ?, data_type = ? WHERE user_id = " . $user_id, [
    //         $_POST["name"], $_POST["data_type"]
    //     ]);
