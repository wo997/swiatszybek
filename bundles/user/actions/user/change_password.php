<?php //route[{USER}/change_password]

$response = User::getCurrent()->changePassword($_POST["current_password"], $_POST["password"]);
Request::jsonResponse($response);
