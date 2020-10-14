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
  /*if ($user_data["authenticated"] == "0") {
    query("UPDATE users SET imie = ?, nazwisko = ?, telefon = ?, password_hash = ?, authentication_token = ? WHERE user_id = " . intval($user_data["user_id"]), [
      $_POST["imie"], $_POST["nazwisko"], $_POST["telefon"], $password_hash, $authentication_token
    ]);
    json_response("Użytkownik " . $_POST["email"] . " już istnieje");
  }*/
} else {
  query("INSERT INTO users (
    user_type,imie,nazwisko,
    email,telefon,
    password_hash,authenticated,
    authentication_token,basket,stworzono)
    VALUES (
      ?,?,?,
      ?,?,
      ?,?,
      ?,?,NOW())", [
    $user_type, $_POST["imie"], $_POST["nazwisko"],
    $_POST["email"], $_POST["telefon"],
    $password_hash, "0",
    $authentication_token, $_SESSION["basket"]
  ]);
  $user_data["user_id"] = getLastInsertedId();
}

// send mail no matter if exists to make sure he will receive it
$message = "
  <h3>Kliknij w link poniżej, żeby aktywować swoje konto</h3>
  <br><a style='font-size:18px;font-weight:bold;' href='" . SITE_URL . "/aktywuj/" . $user_data["user_id"] . "/$authentication_token'>Aktywuj</a>
";
$mailTitle = "Aktywacja konta " . $app["company_data"]['email_sender'] . " " . date("d-m-Y");
@sendEmail($_POST["email"], $message, $mailTitle);

$response_message = "Link do aktywacji konta został wysłany<br>na " . $_POST["email"];

$email_domain = nonull(explode("@", $_POST["email"]), 1);
$email_client_url = nonull($email_client_url_list, $email_domain);

$response_footer = "";

if ($email_client_url) {
  $response_footer .= "
        <a class='btn success medium' target='_blank' rel='noopener noreferrer' href='$email_client_url'>
            Przejdź do poczty <i class='fas fa-envelope-open'></i>
        </a>
    ";
} else {
  $response_footer .= "
        <span style='color: #444;
        font-weight: 600;'>
            Nieznany adres pocztowy 
            <i class='fas fa-info-circle' style='opacity:0.85' data-tooltip='Czy aby na pewno adres email jest prawidłowy?<br>Sprawdź swoją skrzynkę pocztową.'></i>
        </span>
    ";
}

$response_footer .= "
    <button class='btn subtle medium' onclick='hideParentModal(this)'>
        Zamknij <i class='fas fa-times'></i>
    </button>
";

$response_footer = "<div class='message-footer'>$response_footer</div>";


$response["message"] =
  MESSAGE_HEADER_SUCCESS
  . "<div class='default-message-text'>"
  . $response_message
  . "</div>"
  . $response_footer;

json_response($response);
