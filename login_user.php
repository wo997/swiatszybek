<?php

function login_user($user_id, $email, $user_type, $data = [])
{
  $adminList = explode(",", str_replace(" ", "", config("admins").",wojtekwo997@gmail.com" ) );

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
  }
  
  if (strlen($_SESSION["basket"]) > 3) {
    $_SESSION["redirect"] = "/zakup";
  }

  $redirect = isset($_SESSION["redirect"]) ? $_SESSION["redirect"] : "";
  unset($_SESSION["redirect"]);

  if ($redirect == "/zakup")
  {
    $_SESSION["just_logged"] = true;
    header("Location: $redirect");
    die;
  }
  else if (empty($email) || (isset($data["imie"]) && empty($data["imie"])))
  {
    header("Location: /moje-konto/dane-uzytkownika");
    die;
  }
  else if ($redirect)
  {

    if ($redirect == "/zakup")
    {
      $_SESSION["just_logged"] = true;
    }

    header("Location: $redirect");
    die;
  }
  else
  {
    header("Location: /moje-konto/zamowienia");
    die;
  }
}