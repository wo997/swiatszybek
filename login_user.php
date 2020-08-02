<?php

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
