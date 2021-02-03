<?php //route[validate_email]

// prevent too frequent calls, I might also require a user to be on a page for 10 seconds, totally doable yay,
// just use a damn session
// that could be done in the kernel as well, a simple helper or idk

$user_data = DB::fetchRow("SELECT authenticated FROM user WHERE type = 'regular' AND email = ?", [$_POST["email"]]);

if ($user_data) {
    jsonResponse($user_data["authenticated"] ? "exists" : "unauthenticated");
} else {
    jsonResponse(validateEmail($_POST["email"]) ? "valid" : "invalid");
}
