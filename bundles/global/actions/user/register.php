<?php //route[register]

$response = [];
$register = User::getCurrent()->register($_POST);

$response["success"] = $register["success"];

if ($register["success"]) {
    $response["email_client_url"] = User::getEmailclientUrl($_POST["email"]);
}

jsonResponse($response);
