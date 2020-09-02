<?php //route[save_user]

if ($app["user"]["permissions"]["backend_access"]) {
    $user_id =  getEntityId("users", nonull($_POST, "user_id", "-1"));
} else {
    $user_id = $app["user"]["id"];
}

$password = nonull($_POST, "password");

// in case the password was filled
if ($password && validatePassword($password)) {
    updateEntity(["password_hash" => getPasswordHash($password), "authentication_token" => generateAuthenticationToken()], "users", "user_id", $user_id);
}

if (isset($_POST["imie"])) {
    if ($app["user"]["type"] == 's') {
        $user_old_data = fetchRow("SELECT email, authentication_token FROM users WHERE user_id = ?", [$user_id]);

        if (trim($email) != trim($user_old_data["email"])) {
            query("UPDATE users SET email_request = ? WHERE user_id = ? LIMIT 1", [
                $email, $user_id
            ]);

            $message = "<p>Kliknij w link poniżej, żeby zatwierdzić zmianę emaila z " . $user_old_data["email"] . " na $email</p><br><a style='font-size:18px' href='" . SITE_URL . "/zmien_email/$user_id/" . $user_old_data["authentication_token"] . "'>Potwierdzam</a>";
            $mailTitle = "Zmiana emaila konta " . config('main_email_sender') . " " . date("d-m-Y");

            // sendEmail($email, $message, $mailTitle);
            $response["message"] = quit("Wysłaliśmy link do zmiany maila na $email", 1);
        }
    } else {
        query("UPDATE users SET email = ? WHERE user_id = ? LIMIT 1", [
            $email, $user_id
        ]);
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
}
