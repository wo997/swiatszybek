<?php //route[zmien_email]

$parts = explode("/", $url);

function quit($message, $type)
{
  echo '<form style="display:none" id="myForm" action="/moje-konto/dane-uzytkownika" method="post">';
  if ($type == 0)
    $color = "#c44";
  else
    $color = "#4c4";

  $message = "<div style='text-align:center;'><h4 style='color: $color;display: inline-block;border: 1px solid $color;padding: 7px;margin: 0 auto;border-radius: 5px;'>$message</h4></div>";
  echo '<input type="text" name="message" value="' . $message . '">';
  echo '</form>';
  echo '<script>';
  echo 'document.getElementById("myForm").submit();';
  echo '</script>';
  die;
}

$user_id = $parts[1];
$authentication_token = $parts[2];

$email_request = fetchValue("SELECT email_request FROM users WHERE user_id = ? AND authentication_token = ? AND email_request IS NOT NULL", [
  $user_id, $authentication_token
]);

if ($email_request) {
  query("UPDATE users SET email = ?, email_request = NULL WHERE user_id = ?", [
    $email_request, $user_id
  ]);
  query("UPDATE users SET email = ?, email_request = NULL WHERE user_id = ?", [
    $email_request, $user_id
  ]);

  $app["user"]["email"] = $email_request;
  $app["user"]["name"] = $email_request;

  $_SESSION["user"] = $app["user"];

  quit("Zmieniono emaila na $email_request", 1);
}

quit("Wystąpił błąd zmiany emaila konta", 0);
