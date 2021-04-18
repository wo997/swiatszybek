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

// TODO: www detection should probably go in here

Request::init();
