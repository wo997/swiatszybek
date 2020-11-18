<?php //route[validate-email]

$response = [];

$user_data = fetchRow("SELECT * FROM `users` WHERE user_type = 'regular' AND email = ?", [$_POST["email"]]);

if ($user_data) {
    json_response($user_data["authenticated"] ? "exists" : "unauthenticated");
} else {
    json_response(validateEmail($_POST["email"]) ? "valid" : "invalid");
}
