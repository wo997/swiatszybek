<?php //route[register]

$response = [];
$register = User::getCurrent()->register($_POST);

$response["success"] = $register["success"];

if ($register["success"]) {
    $email_domain = def(explode("@", $_POST["email"]), 1);
    $email_client_url = def(User::$email_client_urls, $email_domain, "");

    $response["email_client_url"] = $email_client_url;
}

json_response($response);
