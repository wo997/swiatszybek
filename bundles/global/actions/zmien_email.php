<?php //route[zmien_email]

// function quit($message, $type)
// {
//     $_SESSION["message"] = [
//         "text" => $message,
//         "type" => $type
//     ];
//     redirect("/moje-konto/dane-uzytkownika");
// }

// $user_id = urlParam(1);
// $authentication_token = urlParam(2);

// $email_request = DB::fetchVal("SELECT email_request FROM users WHERE user_id = ? AND authentication_token = ? AND email_request IS NOT NULL", [
//     $user_id, $authentication_token
// ]);

// if ($email_request) {
//     DB::execute("UPDATE users SET email = ?, email_request = NULL WHERE user_id = ?", [
//         $email_request, $user_id
//     ]);

//     User::getCurrent()->data["email"] = $email_request;
//     User::getCurrent()->getDisplayName() = $email_request;

//     $_SESSION["user"] = $app["user"];

//     quit("Zmieniono emaila na $email_request", "info");
// }

// quit("Wystąpił błąd zmiany emaila konta", "warning");
