<?php //route[/reset_password_link]

$response = User::sendResetPasswordLink($_POST["email"]);

if ($response["success"]) {
    $response["data"]["email_client_url"] = User::getEmailclientUrl($_POST["email"]);
}

Request::jsonResponse($response);
