<?php //route[/user/register]

$response = [];
$register = User::getCurrent()->register($_POST);

$response["success"] = $register["success"];

if ($register["success"]) {
    $response["email_client_url"] = User::getEmailclientUrl($_POST["email"]);
    $response["email"] = $_POST["email"];
}

Request::jsonResponse($response);
