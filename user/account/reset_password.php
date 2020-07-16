<?php //->[reset_password]

function quit($message,$type,$destitation)
{
  echo '<form style="display:none" id="myForm" action="/'.$destitation.'" method="post">';
  if ($type == 0)
    $color = "#c44";
  else
    $color = "#4c4";

  $message = "<div style='text-align:center;'><h4 style='color: $color;display: inline-block;border: 1px solid $color;padding: 7px;margin: 0 auto;border-radius: 5px;'>$message</h4></div>";
  echo '<input type="text" name="message" value="'.$message.'">';
  echo '</form>';
	echo '<script>';
	echo 'document.getElementById("myForm").submit();';
	echo '</script>';
	die;
}

$email = $_POST["email"];

// is unauthenticated? fuck off
$user_id = fetchValue("SELECT user_id FROM users WHERE email = ? AND authenticated = 0", [$email]);

if ($user_id)
{
  quit("Wyloguj się i przejdź proces rejestracji",0,'moje-konto');
}

if (isset($_POST["password"]) && isset($_POST["user_id"]) && isset($_POST["authentication_token"]))
{
  $password = $_POST["password"];
  $user_id = $_POST["user_id"];
  $authentication_token = $_POST["authentication_token"];
  $password_hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

  query("UPDATE users SET password_hash = ?, authenticated = '1' WHERE user_id = ? AND authentication_token = ?",[
    $password_hash, $_POST["user_id"], $authentication_token
  ]);

  $back = "logowanie";
  if (isset($_POST["moje-konto"]))
    $back = "moje-konto/resetowanie-hasla";

  quit("Zmieniono hasło konta $email",1,$back);
}

$user_data = fetchRow("SELECT user_id, authentication_token FROM users WHERE email = ?", [$email]);

if ($user_data)
{
  $message = "<h2>Kliknij w link poniżej, żeby zmienić swoje hasło</h2><br><a style='font-size:18px' href='$SITE_URL/resetowanie-hasla/".$user_data["user_id"]."/".$user_data["authentication_token"]."'>Zmień hasło</a>";

  $mailTitle = "Zmiana hasła konta ".config('main_email_sender')." ".date("d-m-Y");

  sendEmail($email, $message, $mailTitle);

  quit("Wysłaliśmy link do zmiany hasła na $email",1,"resetowanie-hasla");
}
else quit("Konto $email nie istnieje",0,"resetowanie-hasla");
