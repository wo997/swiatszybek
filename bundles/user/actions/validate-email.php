<?php //route[validate-email]

$response = [];

// TODO: grab just 1? for eff purp ofc
$user_data = DB::fetchRow("SELECT * FROM `users` WHERE user_type = 'regular' AND email = ?", [$_POST["email"]]);

if ($user_data) {
    json_response($user_data["authenticated"] ? "exists" : "unauthenticated");
} else {
    json_response(validateEmail($_POST["email"]) ? "valid" : "invalid");
}
