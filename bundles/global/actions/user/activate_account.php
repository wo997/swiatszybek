<?php //route[activate_account]

$user_id = Request::urlParam(1);
$authentication_token = Request::urlParam(2);

$activate = User::activateAccount($user_id, $authentication_token);

if ($activate["success"]) {
    setSingleUsageSessionVar("message_modal", json_encode(["type" => "success", "body" => "Konto zostało aktywowane pomyślnie!"]));
} else {
    $res = ["type" => "error"];

    $body = join("<br>", $activate["errors"]);


    if ($user_id) {
        $email = DB::fetchVal("SELECT email FROM user WHERE user_id = ?", [$user_id]);
        if ($email) {
            $res["footer"] = "<button class='btn subtle medium' onclick='hideParentModal(this)' style='width:80px'>Ok</button>";
            $res["footer"] .= "<a class='btn success medium' target='_blank' rel='noopener noreferrer' onclick='register(false)'>Wyślij ponownie <i class='fas fa-redo-alt'></i></a>";
            $_SESSION["register_email"] = $email;
        }
    }

    $res["body"] = $body;
    setSingleUsageSessionVar("message_modal", json_encode($res));

    redirect("/rejestracja");
}

redirect("/");
