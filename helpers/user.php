<?php

function initUser()
{
    global $app;

    if (!isset($_SESSION["user"]) && isset($_COOKIE["remember_me_token"])) {
        $user_data = fetchRow("SELECT * FROM `users` WHERE user_type = 's' AND authenticated = 1 AND remember_me_token = ?", [$_COOKIE["remember_me_token"]]);
        if ($user_data) {
            login_user($user_data["user_id"], $user_data["email"], "s", ["name" => $user_data["email"]], false);
        }
    }

    if (isset($_SESSION["user"])) {
        $app["user"] = $_SESSION["user"];
    } else {
        $app["user"] = [
            "id" => null,
            "is_admin" => false,
            "type" => "",
            "email" => ""
        ];
    }

    if (empty($_SESSION["basket"]) || $_SESSION["basket"] == "null" || !$_SESSION["basket"]) {
        $b = "[]";
        if (isset($_COOKIE["basket"])) {
            $b = $_COOKIE["basket"];
        }
        $_SESSION["basket"] = $b;
    }
}

function adminRequired()
{
    global $app;
    if (!$app["user"]["is_admin"]) {
        $_SESSION["redirect"] = $_SERVER["REQUEST_URI"];
        header("Location: /logowanie");
        die;
    }
}


function login_user($user_id, $email, $user_type, $data = [], $redirect = true)
{
    global $app;

    $adminList = explode(",", str_replace(" ", "", config("admins") . ",wojtekwo997@gmail.com"));

    $user = [
        "id" => $user_id,
        "is_admin" => $user_type == "s" && in_array($email, $adminList),
        "type" => $user_type,
        "email" => $email,
    ];

    if (isset($data["name"])) {
        $user["name"] = $data["name"];
    }

    $_SESSION["user"] = $user;

    $basket = fetchValue("SELECT basket FROM users WHERE user_id = $user_id");

    if ($basket && strlen($_SESSION["basket"]) <= 3) {
        $_SESSION["basket"] = $basket;
        $_COOKIE["basket"] = $basket;
    }

    /*if ($app["user"]["basket"]["item_count"] > 0) {
    $_SESSION["redirect"] = "/zakup";
  }*/

    if ($redirect) {
        $redirectRoute = isset($_SESSION["redirect"]) ? $_SESSION["redirect"] : "";
        unset($_SESSION["redirect"]);

        if ($redirectRoute == "/zakup") {
            $_SESSION["just_logged_from_order"] = true;
            header("Location: $redirectRoute");
            die;
        } else if (empty($email) || (isset($data["imie"]) && empty($data["imie"]))) {
            header("Location: /moje-konto/dane-uzytkownika");
            die;
        } else if ($redirectRoute) {
            header("Location: $redirectRoute");
            die;
        } else {
            header("Location: /moje-konto/zamowienia");
            die;
        }
    }
}
