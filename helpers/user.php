<?php

$visitor_permissions = ["backend_access" => false];
$permission_list = [
    0 => ["name" => "Klient", "backend_access" => false],
    1 => ["name" => "Admin", "backend_access" => true],
    2 => ["name" => "Sprzedawca", "backend_access" => true],
];

function initUser()
{
    global $app, $visitor_permissions;

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
            "permissions" => $visitor_permissions,
            "type" => "",
            "email" => ""
        ];
    }

    $app["user"]["permissions"] = array_merge($visitor_permissions, $app["user"]["permissions"]);

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
    if (!$app["user"]["permissions"]["backend_access"]) {
        $_SESSION["redirect"] = $_SERVER["REQUEST_URI"];
        header("Location: /logowanie");
        die;
    }
}


function login_user($user_id, $email, $user_type, $data = [], $redirect = true)
{
    global $app, $permission_list;

    // $adminList = explode(",", str_replace(" ", "", config("admins")));
    // $adminList[] = secret("super_admin_email");
    $user_data = fetchRow("SELECT * FROM users WHERE user_id = $user_id");

    $user = [
        "id" => $user_id,
        "permissions" => $permission_list[$user_data["permissions"]],
        "type" => $user_type,
        "email" => $email,
    ];

    if (isset($data["name"])) {
        $user["name"] = $data["name"];
    }

    $_SESSION["user"] = $user;

    $basket = $user_data["basket"];

    if ($basket && strlen($_SESSION["basket"]) <= 3) {
        setBasketData($basket);
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

function getPasswordHash($val)
{
    return password_hash($val, PASSWORD_BCRYPT, ['cost' => 12]);
}

function generateAuthenticationToken()
{
    return bin2hex(random_bytes(10));
}
