<?php //route[save_user]
if (isset($_POST["user_id"])) {
    if ($app["user"]["permissions"]["backend_access"]) {
        $user_id = getEntityId("users", $_POST["user_id"]);
    } else {
        $user_id = $_POST["user_id"];
    }
} else {
    $user_id = $app["user"]["id"];
}

$response["message"] = "<p>";

$password = nonull($_POST, "password");

// in case the password was filled
if ($password && validatePassword($password)) {
    updateEntity(["password_hash" => getPasswordHash($password), "authentication_token" => generateAuthenticationToken()], "users", "user_id", $user_id);
    $response["message"] .= "Hasło zostało zmienione<br>";
}

if (isset($_POST["imie"])) {
    $data = filterArrayKeys($_POST, [
        "imie",
        "nazwisko",
        "telefon",
        "firma",
        "kraj",
        "miejscowosc",
        "kod_pocztowy",
        "ulica",
        "nr_domu",
        "nip",
        "nr_lokalu",
    ]);
    updateEntity($data, "users", "user_id", $user_id);
    $response["message"] .= "Dane zmieniono pomyślnie.<br>";

    $email = trim($_POST["email"]);
    $user_old_data = fetchRow("SELECT email, authentication_token FROM users WHERE user_id = ?", [$user_id]);

    if ($email != trim($user_old_data["email"])) {
        if ($app["user"]["type"] == 's') {
            updateEntity(["email_request" => $email], "users", "user_id", $user_id);

            query("UPDATE users SET email_request = ? WHERE user_id = ? LIMIT 1", [
                $email, $user_id
            ]);

            function get_email_redirect_button($email_client)
            {
                if ($email_client) {
                    return "
                        <a class='btn admin-primary' target='_blank' rel='noopener noreferrer' href='$email_client'>
                            Przejdź do poczty <i class='fas fa-envelope'></i>
                        </a>
                    ";
                } else {
                    return "
                        <span>
                            Nieznany adres pocztowy 
                            <i class='fas fa-info-circle' data-tooltip='Sprawdź czy wpisałeś poprawny adres email. Jeśli tak to przejdź na pocztę.'></i>
                        </span>    
                    ";
                }
            }

            $email_client = "";
            $email_domain = explode("@", $email)[1];
            if (array_key_exists($email_domain, $email_client_list)) {
                $email_client = $email_client_list[$email_domain];
            }

            $message = "<p>Kliknij w link poniżej, żeby zatwierdzić zmianę emaila z " . $user_old_data["email"] . " na $email</p><br><a style='font-size:18px' href='" . SITE_URL . "/zmien_email/$user_id/" . $user_old_data["authentication_token"] . "'>Potwierdzam</a>";
            $mailTitle = "Zmiana emaila konta " . config('main_email_sender') . " " . date("d-m-Y");

            // sendEmail($email, $message, $mailTitle);
            $response["message"] .= "Wysłaliśmy link do zmiany adresu email<br>na $email.<br></p>" . get_email_redirect_button($email_client);
            $response["message"] .= "
                <button class='btn admin-secondary' style='width: 100px;' onclick='hideParentModal(this)'>
                    Zamknij <i class='fas fa-times'></i>
                </button>
            ";
            $response["email"] = ["old" => $user_old_data["email"], "new" => $email,];
        } else {
            updateEntity(["email" => $email], "users", "user_id", $user_id);
        }
    }
}

json_response($response);
