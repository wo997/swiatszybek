<?php //route[admin/save_user]

$user_id = getEntityId("users", nonull($_POST, "user_id", "-1"));

$password = nonull($_POST, "password");

// also means that the password was filled
if ($password && validatePassword($password)) {
    updateEntity(["password_hash" => getPasswordHash($password), "authentication_token" => generateAuthenticationToken()], "users", "user_id", $user_id);
}

$data = [
    "imie" => $_POST["imie"],
    "nazwisko" => $_POST["nazwisko"],
    "email" => $_POST["email"],
    "telefon" => $_POST["telefon"],
    "firma" => $_POST["firma"],
    "kraj" => $_POST["kraj"],
    "miejscowosc" => $_POST["miejscowosc"],
    "kod_pocztowy" => $_POST["kod_pocztowy"],
    "ulica" => $_POST["ulica"],
    "nr_domu" => $_POST["nr_domu"],
    "nip" => $_POST["nip"],
    "nr_lokalu" => $_POST["nr_lokalu"],
    "permissions" => $_POST["permissions"],
];
updateEntity($data, "users", "user_id", $user_id);
