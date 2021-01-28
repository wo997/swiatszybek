<?php //route[reset_password]

$response = User::reset($_POST);
json_response($response);
