<?php //route[user-exists]

$response = [];

$user_data = fetchRow("SELECT * FROM `users` WHERE user_type = 'regular' AND email = ?", [$_POST["email"]]);
json_response($user_data ? 1 : 0);
