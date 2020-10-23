<?php //route[save_user]

$response_header = MESSAGE_HEADER_SUCCESS;

$response_footer = "";

$response = [];

if (isset($_POST["user_id"])) {
    if ($app["user"]["privelege_id"]["backend_access"]) {
        $user_id = getEntityId("users", $_POST["user_id"]);
    } else {
        $user_id = $_POST["user_id"];
    }
} else {
    $user_id = $app["user"]["id"];
}

$password = nonull($_POST, "password");

// in case the password was filled
if ($password && validatePassword($password)) {
    updateEntity(["password_hash" => getPasswordHash($password), "authentication_token" => generateAuthenticationToken()], "users", "user_id", $user_id);

    $response_footer = MESSAGE_OK_BUTTON;

    // TODO: send email

    $response["message"] =
        MESSAGE_HEADER_SUCCESS
        . "<div class='default-message-text'>Hasło zostało zmienione.</div>"
        . $response_footer;
}

if (isset($_POST["imie"])) {

    $response_body = [];
    $response_body[] = "Dane zostały zapisane.";

    $response_footer = MESSAGE_OK_BUTTON;

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

    $email = trim($_POST["email"]);
    $user_old_data = fetchRow("SELECT email, authentication_token FROM users WHERE user_id = ?", [$user_id]);

    if ($email != trim($user_old_data["email"])) {
        if ($app["user"]["type"] == 'regular') {
            updateEntity(["email_request" => $email], "users", "user_id", $user_id);

            query("UPDATE users SET email_request = ? WHERE user_id = ? LIMIT 1", [
                $email, $user_id
            ]);

            // send email
            $message = "
                <p>Kliknij w link poniżej, żeby potwierdzić zmianę emaila z " . $user_old_data["email"] . " na $email</p>
                <br>
                <a style='font-size:18px' href='" . SITE_URL . "/zmien_email/$user_id/" . $user_old_data["authentication_token"] . "'>Potwierdzam</a>";
            $mailTitle = "Zmiana emaila konta " . $app["company_data"]['email_sender'] . " " . date("d-m-Y");
            @sendEmail($email, $message, $mailTitle);

            $response_body[] = "Wysłaliśmy link do zmiany adresu email na $email.";

            $response_footer = "";

            $email_domain = nonull(explode("@", $email), 1);
            $email_client_url = nonull(EMAIL_CLIENT_URLS, $email_domain);

            if ($email_client_url) {
                $response_footer .= "
                    <a class='btn success medium' target='_blank' rel='noopener noreferrer' href='$email_client_url'>
                        Przejdź do poczty <i class='fas fa-envelope-open'></i>
                    </a>
                ";
            } else {
                $response_footer .= "
                    <span style='color: #444;
                    font-weight: 600;'>
                        Nieznany adres pocztowy 
                        <i class='fas fa-info-circle' style='opacity:0.85' data-tooltip='Czy aby na pewno adres email jest prawidłowy?<br>Sprawdź swoją skrzynkę pocztową.'></i>
                    </span>
                ";
            }

            $response_footer .= "
                <button class='btn subtle medium' onclick='hideParentModal(this)'>
                    Zamknij <img class='cross-icon' src='/src/img/cross.svg'>
                </button>
            ";

            $response_footer = "<div class='message-footer'>$response_footer</div>";

            $response["emails"] = ["previous" => $user_old_data["email"], "new" => $email];
        } else {
            updateEntity(["email" => $email], "users", "user_id", $user_id);
        }
    }

    if ($response_body) {
        if (isset($response_body[1])) {
            $response_message = join("<div style='height:9px;'></div>", $response_body);
        } else {
            $response_message = $response_body[0];
        }

        $response["message"] =
            MESSAGE_HEADER_SUCCESS
            . "<div class='default-message-text'>"
            . $response_message
            . "</div>"
            . $response_footer;
    }
}

if ($response) {
    json_response($response);
} else {
    die;
}
