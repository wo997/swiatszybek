<?php //route[register]

$posts = ["password", "email", "telefon", "imie", "nazwisko"];

foreach ($posts as $p) {
  if (!isset($_POST[$p]))
    die;
}

$response = [];

/*if (!validateEmail($_POST["email"])) {
  $response["message"] = "Wpisz poprawny adres email";
  // $response[]
}
if (validatePassword($_POST["password"])) {
  $response["message"] = "Wpisz poprawny adres email";
  // $response[]
}*/

$user_type = "regular";

// check if has email
$user_data = fetchRow("SELECT user_id, authenticated, authentication_token, password_hash FROM `users` WHERE user_type = '$user_type' AND email = ?", [$_POST["email"]]);

$password_hash = getPasswordHash($_POST["password"]);
$authentication_token = generateAuthenticationToken();

if ($user_data) {
  if ($user_data["authenticated"] == "0") {
    query("UPDATE users SET imie = ?, nazwisko = ?, telefon = ?, password_hash = ?, authentication_token = ? WHERE user_id = " . intval($user_data["user_id"]), [
      $_POST["imie"], $_POST["nazwisko"], $_POST["telefon"], $password_hash, $authentication_token
    ]);
    json_response("Użytkownik " . $_POST["email"] . " już istnieje");
  }
} else {
  query("INSERT INTO users (user_type,imie,    nazwisko,           email,          telefon,             password_hash,    authenticated,authentication_token,    basket,             stworzono) VALUES (?,?,?,?,?,?,?,?,?,NOW())", [
    $user_type, $_POST["imie"], $_POST["nazwisko"], $_POST["email"], $_POST["telefon"], $password_hash,   "0",         $authentication_token,   $_SESSION["basket"]
  ]);
  $user_data["user_id"] = getLastInsertedId();
}

// send mail no matter if exists to make sure he will receive it
$message = "<h2>Kliknij w link poniżej, żeby aktywować swoje konto</h2><br><a style='font-size:18px' href='" . SITE_URL . "/aktywuj/" . $user_data["user_id"] . "/$authentication_token'>Aktywuj</a>";
$mailTitle = "Aktywacja konta " . config('main_email_sender') . " " . date("d-m-Y");
@sendEmail($_POST["email"], $message, $mailTitle);

json_response("Wysłaliśmy link aktywacyjny na twoją skrzynkę pocztową");
