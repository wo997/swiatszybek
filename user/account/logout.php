<?php //route[logout]
unset($_SESSION["user"]);
setcookie("remember_me_token", "", time() - 3600);

if (isset($_SERVER["HTTP_REFERER"]) && strpos($_SERVER["HTTP_REFERER"], $SITE_URL) !== 0) {
    header("Location: " . $_SERVER["HTTP_REFERER"]);
} else {
    header("Location: /");
}
die;
