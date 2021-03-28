<?php //route[/user/login]

$login_res = User::getCurrent()->login($_POST["email"], $_POST["password"]);
Request::jsonResponse($login_res);
