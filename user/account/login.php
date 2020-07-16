<?php //->[login]

$posts = ["password","email"];

foreach ($posts as $p)
{
  if (!isset($_POST[$p]))
    die;
}

if (strpos($_SERVER["HTTP_REFERER"],"/zakup") !== false)
{
  $_SESSION["redirect"] = "/zakup";
}

function quit($message,$type)
{
  echo '<form style="display:none" id="myForm" action="/logowanie" method="post">';
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

$password = $_POST["password"];
$email = $_POST["email"];

$stmt = $con->prepare("SELECT user_id, authenticated, password_hash FROM `users` WHERE user_type = 's' AND email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->bind_result($user_id, $authenticated, $password_hash);
//mysqli_stmt_fetch($stmt);

if (mysqli_stmt_fetch($stmt) && password_verify($password,$password_hash))
{
  $stmt->close();
  if ($authenticated == "1")
  {
    login_user($user_id, $email, "s", ["name" => $email]);
  }
  else quit("Konto nie zostało aktywowane",0);
}
else quit("Wpisz poprawny e-mail i hasło",0);
$stmt->close();
