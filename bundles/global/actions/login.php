<?php //route[login]

$login_res = User::getCurrent()->login($_POST["email"], $_POST["password"]);
jsonResponse($login_res);
