<?php

define("visitor_priveleges", ["backend_access" => false]);
$privelege_list = [
    ["id" => 0, "name" => "Klient", "backend_access" => false],
    ["id" => 1, "name" => "Admin", "backend_access" => true],
    ["id" => 2, "name" => "Sprzedawca", "backend_access" => true],
];

function initUser()
{
    global $app;

    if (isset($_SESSION["user"])) {
        $app["user"] = $_SESSION["user"];
    } else {
        $app["user"] = [
            "id" => null,
            "privelege_id" => visitor_priveleges,
            "type" => "",
            "email" => ""
        ];
    }

    if (!isset($_SESSION["user"]) && isset($_COOKIE["remember_me_token"])) {
        $user_data = DB::fetchRow("SELECT * FROM `users` WHERE user_type = 'regular' AND authenticated = 1 AND remember_me_token = ?", [$_COOKIE["remember_me_token"]]);
        if ($user_data) {
            loginUser($user_data["user_id"], $user_data["email"], "regular", ["name" => $user_data["email"]], false);
        }
    }

    $app["user"]["priveleges"] = array_merge(visitor_priveleges, $app["user"]["privelege_id"]);

    if (empty($_SESSION["basket"]) || $_SESSION["basket"] == "null" || !$_SESSION["basket"]) {
        $b = "[]";
        if (isset($_COOKIE["basket"])) {
            $b = $_COOKIE["basket"];
        }
        setBasketData($b);
    }
}

function adminRequired()
{
    global $app;
    if (!$app["user"]["priveleges"]["backend_access"]) {
        $_SESSION["redirect_on_login"] = $_SERVER["REQUEST_URI"];
        redirect("/logowanie");
    }
}

function loginUser($user_id, $email, $user_type, $data = [])
{
    global $privelege_list;

    $_SESSION["just_logged_in"] = true;

    $user_data = DB::fetchRow("SELECT * FROM users WHERE user_id = $user_id");

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

    // bring basket back if empty only?
    $basket = $user_data["basket"];
    // I think we should prompt the user in other case what he wanna do, correct?
    if ($basket && count(getBasketData()) < 1) {
        setBasketData($basket);
    }

    $last_viewed_products_safe_string = preg_replace("/[^0-9,]/", "", $user_data["last_viewed_products"]);
    $last_viewed_products = explode(",", $last_viewed_products_safe_string);
    addLastViewedProducts($last_viewed_products, false);

    if (isset($_SESSION["redirect_on_login"])) {
        $url = $_SESSION["redirect_on_login"];
        unset($_SESSION["redirect_on_login"]);
        redirect($url);
    } else {
        reload();
    }
}

function getPasswordHash($val)
{
    return password_hash($val, PASSWORD_BCRYPT, ['cost' => 12]);
}

function generateAuthenticationToken($length = 14)
{
    return bin2hex(random_bytes($length));
}
