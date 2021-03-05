<?php //route[/reset_password]

$response = User::reset($_POST);
Request::jsonResponse($response);
