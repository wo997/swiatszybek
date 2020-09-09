<?php //route[google/login]

// Get $id_token via HTTPS POST.

if (!isset($_POST['id_token']) || strlen($_POST['id_token']) < 10) {
  header("Location: /");
  die;
}

// if (strpos($_SERVER["HTTP_REFERER"], "/zakup") !== false) {
//   $_SESSION["redirect"] = "/zakup";
// }

$id_token = $_POST['id_token'];

$client = new Google_Client(['client_id' => secret('google_client_id')]);  // Specify the CLIENT_ID of the app that accesses the backend
$payload = $client->verifyIdToken($id_token);

if (!$payload) {
  header("Location: /");
  die;
}

$user_type = 'g';
$authentication_token = $payload['sub'];
$google_email = $payload['email'];

$user_data = fetchRow("SELECT user_id, email, imie FROM users WHERE user_type = '$user_type' AND authentication_token = ?", [$authentication_token]);

if ($user_data) {
  $user_id = $user_data["user_id"];
} else // new user
{
  query("INSERT INTO users (user_type,email,authenticated,authentication_token,kraj,stworzono) VALUES (?,?,?,?,?,NOW())", [
    $user_type, $google_email, "1", $authentication_token, "Polska"
  ]);

  $user_id = getLastInsertedId();
}

login_user($user_id, $google_email, $user_type, ['name' => $payload['name']]);
