<?php //route[/user/reset_password]

$response = User::resetPassword($_POST);
Request::jsonResponse($response);
