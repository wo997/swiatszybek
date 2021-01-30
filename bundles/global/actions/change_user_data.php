<?php //route[change_user_data]

if (!User::getCurrent()->getId()) {
    die;
}

$posts = ["imie", "nazwisko", "email", "telefon", "firma", "kraj", "miejscowosc", "kod_pocztowy", "ulica", "nr_domu", "nip", "nr_lokalu"];

foreach ($posts as $p) {
    if (!isset($_POST[$p]))
        die($p);

    $$p = $_POST[$p];
}

$user_id = User::getCurrent()->getId();

// function quit($message, $type)
// {
//   echo '<form style="display:none" id="myForm" action="/moje-konto/dane-uzytkownika" method="post">';
//   if ($type == 0)
//     $color = "#c44";
//   else
//     $color = "#4c4";

//   $message = "<div style='text-align:center;'><h4 style='color: $color;display: inline-block;border: 1px solid $color;padding: 7px;margin: 0 auto;border-radius: 5px;'>$message</h4></div>";
//   echo '<input type="text" name="message" value="' . $message . '">';
//   echo '</form>';
//   echo '<script>';
//   echo 'document.querySelector("#myForm").submit();';
//   echo '</script>';
//   die;
// }

$response = [];

function quit($message, $type)
{
    if ($type == 0)
        $color = "#c44";
    else
        $color = "#4c4";

    return "<div style='text-align:center;'><h4 style='color: $color;display: inline-block;border: 1px solid $color;padding: 7px;margin: 0 auto;border-radius: 5px;'>$message</h4></div>";
}

DB::execute("UPDATE users SET imie = ?, nazwisko = ?, telefon = ?, firma = ?, kraj = ?, miejscowosc = ?, kod_pocztowy = ?, ulica = ?, nr_domu = ?, nip = ?, nr_lokalu = ? WHERE user_id = ? LIMIT 1", [
    $imie, $nazwisko, $telefon, $firma, $kraj, $miejscowosc, $kod_pocztowy, $ulica, $nr_domu, $nip, $nr_lokalu, $user_id
]);

$response["message"] = quit("Zapisano zmiany", 1);

if (User::getCurrent()->data["type"] == 'regular') {
    $user_old_data = DB::fetchRow("SELECT email, authentication_token FROM users WHERE user_id = ?", [$user_id]);

    if (trim($email) != trim($user_old_data["email"])) {
        DB::execute("UPDATE users SET email_request = ? WHERE user_id = ? LIMIT 1", [
            $email, $user_id
        ]);

        $message = "<p>Kliknij w link poniżej, żeby zatwierdzić zmianę emaila z " . $user_old_data["email"] . " na $email</p><br><a style='font-size:18px' href='" . SITE_URL . "/zmien_email/$user_id/" . $user_old_data["authentication_token"] . "'>Potwierdzam</a>";
        $mailTitle = "Zmiana emaila konta " . $app["company_data"]['email_sender'] . " " . date("d-m-Y");

        sendEmail($email, $message, $mailTitle);
        $response["message"] = quit("Wysłaliśmy link do zmiany maila na $email", 1);
    }
} else {
    DB::execute("UPDATE users SET email = ? WHERE user_id = ? LIMIT 1", [
        $email, $user_id
    ]);
}
$response["data"] = DB::fetchRow("SELECT imie, nazwisko, email, telefon, firma, kraj, miejscowosc, kod_pocztowy, ulica, nr_domu, nip, nr_lokalu FROM users WHERE user_id = ?", [$user_id]);
json_response($response);