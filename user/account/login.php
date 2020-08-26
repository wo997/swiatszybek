<?php //route[login]

$posts = ["password", "email"];

foreach ($posts as $p) {
  if (!isset($_POST[$p]))
    die;
}

if (strpos($_SERVER["HTTP_REFERER"], "/zakup") !== false) {
  $_SESSION["redirect"] = "/zakup";
}

function quit($message, $type)
{
  echo '<form style="display:none" id="myForm" action="/logowanie" method="post">';
  if ($type == 0)
    $color = "#c44";
  else
    $color = "#4c4";

  $message = "<div style='text-align:center;'><h4 style='color: $color;display: inline-block;border: 1px solid $color;padding: 7px;margin: 0 auto;border-radius: 5px;'>$message</h4></div>";
  echo '<input type="text" name="message" value="' . $message . '">';
  echo '</form>';
  echo '<script>';
  echo 'document.querySelector("#myForm").submit();';
  echo '</script>';
  die;
}

$password = $_POST["password"];
$email = $_POST["email"];

$user_data = fetchRow("SELECT * FROM `users` WHERE user_type = 's' AND email = ?", [$email]);
if (!$user_data || !password_verify($password, $user_data["password_hash"])) {
  quit("Wpisz poprawny e-mail i hasło", 0);
}
if (!$user_data["authenticated"]) {
  quit("Konto nie zostało aktywowane", 0);
}

$remember_me = nonull($_POST, "remember_me", 0);

if ($remember_me) {
  $remember_me_token = $user_data["user_id"] . "-" . generateAuthenticationToken(14);
  setcookie("remember_me_token", $remember_me_token, time() + 3600 * 24 * 30);
  query("UPDATE users SET remember_me_token = ? WHERE user_id = " . intval($user_data["user_id"]), [$remember_me_token]);
}

login_user($user_data["user_id"], $user_data["email"], "s", ["name" => $user_data["email"]]);
