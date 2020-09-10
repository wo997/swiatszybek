<?php

$visitor_priveleges = ["backend_access" => false];
$privelege_list = [
    ["id" => 0, "name" => "Klient", "backend_access" => false],
    ["id" => 1, "name" => "Admin", "backend_access" => true],
    ["id" => 2, "name" => "Sprzedawca", "backend_access" => true],
];

function initUser()
{
    global $app, $visitor_priveleges;

    if (isset($_SESSION["user"])) {
        $app["user"] = $_SESSION["user"];
    } else {
        $app["user"] = [
            "id" => null,
            "privelege_id" => $visitor_priveleges,
            "type" => "",
            "email" => ""
        ];
    }

    if (!isset($_SESSION["user"]) && isset($_COOKIE["remember_me_token"])) {
        $user_data = fetchRow("SELECT * FROM `users` WHERE user_type = 's' AND authenticated = 1 AND remember_me_token = ?", [$_COOKIE["remember_me_token"]]);
        if ($user_data) {
            login_user($user_data["user_id"], $user_data["email"], "s", ["name" => $user_data["email"]], false);
        }
    }

    $app["user"]["priveleges"] = array_merge($visitor_priveleges, $app["user"]["privelege_id"]);

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
    if (!$app["user"]["priveleges"]["backend_access"]) {
        $_SESSION["redirect"] = $_SERVER["REQUEST_URI"];
        header("Location: /logowanie");
        die;
    }
}

function login_user($user_id, $email, $user_type, $data = [], $redirect = true)
{
    global $app, $privelege_list;

    // $adminList = explode(",", str_replace(" ", "", config("admins")));
    // $adminList[] = secret("super_admin_email");
    $user_data = fetchRow("SELECT * FROM users WHERE user_id = $user_id");

    $user = [
        "id" => $user_id,
        "privelege_id" => getRowById($privelege_list, $user_data["privelege_id"]),
        "type" => $user_type,
        "email" => $email,
    ];

    if (isset($data["name"])) {
        $user["name"] = $data["name"];
    }

    $_SESSION["user"] = $user;

    $basket = $user_data["basket"];

    if ($basket && strlen(nonull($_SESSION, "basket")) <= 3) {
        setBasketData($basket);
    }

    redirect();
    //redirect("/");

    /*if ($app["user"]["basket"]["item_count"] > 0) {
        $_SESSION["redirect"] = "/zakup";
    }*/

    /*$redirect_url = "/";
    if ($_SERVER['HTTP_REFERER']) {
        $url = parse_url($_SERVER['HTTP_REFERER'], PHP_URL_PATH);
        $redirect_list = [
            "/logowanie" => "/",
        ];
        $redirect_url = nonull($redirect_list, $url, $url);
    }
    redirect($redirect_url);*/

    // if ($redirect) {
    //     $redirectRoute = isset($_SESSION["redirect"]) ? $_SESSION["redirect"] : "";
    //     unset($_SESSION["redirect"]);

    //     if ($redirectRoute == "/zakup") {
    //         $_SESSION["just_logged_from_order"] = true;
    //         header("Location: $redirectRoute");
    //         die;
    //     } else if (empty($email) || (isset($data["imie"]) && empty($data["imie"]))) {
    //         header("Location: /moje-konto/dane-uzytkownika");
    //         die;
    //     } else if ($redirectRoute) {
    //         header("Location: $redirectRoute");
    //         die;
    //     } else {
    //         header("Location: /moje-konto/zamowienia");
    //         die;
    //     }
    // }
}

function getPasswordHash($val)
{
    return password_hash($val, PASSWORD_BCRYPT, ['cost' => 12]);
}

function generateAuthenticationToken($length = 10)
{
    return bin2hex(random_bytes($length));
}
