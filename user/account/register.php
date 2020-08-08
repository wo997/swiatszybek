<?php //route[register]

$posts = ["password", "email", "telefon", "imie", "nazwisko"];

foreach ($posts as $p) {
  if (!isset($_POST[$p]))
    die;
}

function quit($message, $type)
{
  echo '<form style="display:none" id="myForm" action="/rejestracja" method="post">';
  foreach ($_POST as $a => $b) {
    echo '<input type="text" name="' . htmlentities($a) . '" value="' . htmlentities($b) . '">';
  }
  if ($type == 0)
    $color = "#c44";
  else
    $color = "#4c4";

  $message = "<div style='text-align:center;'><h4 style='color: $color;display: inline-block;border: 1px solid $color;padding: 7px;margin: 0 auto;border-radius: 5px;'>$message</h4></div>";
  echo '<input type="text" name="message" value="' . $message . '">';
  echo '</form>';
  echo '<script>';
  echo '$("#myForm").submit();';
  echo '</script>';
  die;
}

if (!filter_var($_POST["email"], FILTER_VALIDATE_EMAIL) || strlen($_POST["password"]) < 8)
  quit("Wpisz poprawny email i hasło", 0);

// check if has email
$user_data = fetchRow("SELECT user_id, authenticated, authentication_token, password_hash FROM `users` WHERE user_type = 's' AND email = ?", [$_POST["email"]]);

$user_exists = false;

$password_hash = password_hash($_POST["password"], PASSWORD_BCRYPT, ['cost' => 12]);
$authentication_token = bin2hex(random_bytes(10));

if ($user_data) {
  if ($user_data["authenticated"] == "0") {
    $user_exists = true;

    query("UPDATE users SET imie = ?, nazwisko = ?, telefon = ?, password_hash = ?, authentication_token = ? WHERE user_id = " . intval($user_data["user_id"]), [
      $_POST["imie"], $_POST["nazwisko"], $_POST["telefon"], $password_hash, $authentication_token
    ]);
  } else quit("Użytkownik " . $_POST["email"] . " już istnieje", 0);
} else {
  query("INSERT INTO users (user_type,imie,    nazwisko,           email,          telefon,             password_hash,    authenticated,authentication_token,    basket,             stworzono) VALUES (?,?,?,?,?,?,?,?,?,NOW())", [
    "s", $_POST["imie"], $_POST["nazwisko"], $_POST["email"], $_POST["telefon"], $password_hash,   "0",         $authentication_token,   $_SESSION["basket"]
  ]);
  $user_data["user_id"] = getLastInsertedId();
}

// send mail no matter if exists to make sure he will receive it
$message = "<h2>Kliknij w link poniżej, żeby aktywować swoje konto</h2><br><a style='font-size:18px' href='$SITE_URL/aktywuj/" . $user_data["user_id"] . "/$authentication_token'>Aktywuj</a>";
$mailTitle = "Aktywacja konta " . config('main_email_sender') . " " . date("d-m-Y");
sendEmail($_POST["email"], $message, $mailTitle);

quit("Wysłaliśmy link aktywacyjny na twoją skrzynkę pocztową", 1);
