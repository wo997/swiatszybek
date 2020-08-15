<?php //route[aktywuj]

$parts = explode("/", $url);

$user_id = $parts[1];
$authentication_token = $parts[2];

$stmt = $con->prepare("UPDATE users SET authenticated = '1', stworzono = NOW() WHERE user_id = ? AND authentication_token = ?");
$stmt->bind_param("ss", $user_id, $authentication_token);
$stmt->execute();

$stmt = $con->prepare("SELECT email, authenticated FROM users WHERE user_id = ?");
$stmt->bind_param("s", $user_id);
$stmt->execute();
$stmt->bind_result($email, $authenticated);
mysqli_stmt_fetch($stmt);

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

if ($authenticated == "1") {
  quit("Konto $email zostało aktywowane", 1);
} else {
  quit("Wystąpił błąd aktywacji konta", 0);
}
