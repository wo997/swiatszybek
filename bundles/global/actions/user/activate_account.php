<?php //route[/konto/aktywuj]

$user_id = Request::urlParam(2);
$authentication_token = Request::urlParam(3);

$activate = User::activateAccount($user_id, $authentication_token);

if ($activate["success"]) {
    Request::setSingleUsageSessionVar("message_modal", json_encode(["type" => "success", "body" => "Konto zostało aktywowane pomyślnie!"]));
} else {
    $res = ["type" => "error"];

    $body = join("<br>", $activate["errors"]);


    if ($user_id) {
        $email = DB::fetchVal("SELECT email FROM user WHERE user_id = ?", [$user_id]);
        if ($email) {
            $res["footer"] = "<button class='btn subtle' onclick='hideParentModal(this)'>Zamknij  <i class='fas fa-times'></i></button>";
            $res["footer"] .= "<a class='btn primary' target='_blank' rel='noopener noreferrer' onclick='registerUser($user_id)'>Wyślij ponownie <i class='fas fa-redo-alt'></i></a>";
            Request::setSingleUsageSessionVar("register_email", $email);
        }
    }

    $res["body"] = $body;
    Request::setSingleUsageSessionVar("message_modal", json_encode($res));

    Request::redirect("/rejestracja");
}

Request::redirect("/");
