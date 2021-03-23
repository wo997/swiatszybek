<?php //route[/validate_email]

// TODO: prevent too frequent calls, I might also require a user to be on a page for 10 seconds, totally doable yay,
// just use a damn session
// firewall could be implemented on kernel level

$user_data = DB::fetchRow("SELECT authenticated FROM user WHERE type = 'regular' AND email = ?", [trim($_POST["email"])]);

if ($user_data) {
    Request::jsonResponse($user_data["authenticated"] ? "exists" : "unauthenticated");
} else {
    Request::jsonResponse(validateEmail($_POST["email"]) ? "valid" : "invalid");
}
