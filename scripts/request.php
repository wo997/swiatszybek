<?php

//define("IS_XHR", isset($_GET["xhr"]) || $_SERVER['REQUEST_METHOD'] === 'POST');
define("IS_XHR", isset($_GET["xhr"]) || isset($_POST["xhr"]));


if (!IS_XHR) {
    if (isset($_SESSION["redirect"])) {
        $redirect = $_SESSION["redirect"];
        unset($_SESSION["redirect"]);
        if ($_SERVER["REQUEST_URI"] != $redirect) {
            header("Location: $redirect");
            die;
        }
    }
}

// ssl redirect
if (getSetting("general", "advanced", ["ssl"]) == 1 && def($_SERVER, "HTTPS", "on") == 'off') {
    redirect(str_replace_first("http://", "https://", SITE_URL, 1));
}
// TODO: www detection should probably go in here

Request::init();
