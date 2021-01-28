<?php //route[activate_account]

$user_id = urlParam(1);
$authentication_token = urlParam(2);

$activate = User::activateAccount($user_id, $authentication_token);

if ($activate["success"]) {
    $_SESSION["message_modal"] = json_encode(["type" => "success", "body" => "Konto zostało aktywowane pomyślnie!"]);
} else {
    $_SESSION["message_modal"] = json_encode(["type" => "error", "body" => join("<br>", $activate["errors"])]);
}

redirect("/");
