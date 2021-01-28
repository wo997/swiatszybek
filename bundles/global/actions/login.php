<?php //route[login]

$login_res = User::getCurrent()->login($_POST["email"], $_POST["password"]);
json_response($login_res);
