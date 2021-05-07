<?php //route[/user/validate_email]

// TODO: prevent too frequent calls, I might also require a user to be on a page for 10 seconds, totally doable yay,
// just use a damn session
// firewall could be implemented on kernel level

$user_data = DB::fetchRow("SELECT authenticated, user_id FROM user WHERE type = 'regular' AND email = ?", [trim($_POST["email"])]);

if ($user_data) {
    Request::jsonResponse([
        "status" => ($user_data["authenticated"] ? "exists"  : "unauthenticated"),
        "user_id" => $user_data["user_id"]
    ]);
} else {
    Request::jsonResponse([
        "status" => Security::validateEmail($_POST["email"]) ? "valid" : "invalid"
    ]);
}
