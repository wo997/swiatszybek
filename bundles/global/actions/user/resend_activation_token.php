<?php //route[/user/resend_activation_token]

$user_id = $_POST["user_id"];

$response = [];
$register = User::sendActivationLink($user_id);

$response["success"] = $register["success"];

if ($register["success"]) {
    $user_data = DB::fetchRow("SELECT email FROM user WHERE user_id = ?", [$user_id]);
    $response["email_client_url"] = User::getEmailclientUrl($user_data["email"]);
    $response["email"] = $user_data["email"];
}

Request::jsonResponse($response);
