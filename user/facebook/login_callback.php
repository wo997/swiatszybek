<?php //route[facebook/login_callback]

if (strpos($_SERVER["HTTP_REFERER"], "/zakup") !== false) {
  $_SESSION["redirect"] = "/zakup";
}

try {
  $accessToken = $fb_helper->getAccessToken();
} catch (Facebook\Exceptions\FacebookResponseException $e) {
  // When Graph returns an error
  echo 'Graph returned an error: ' . $e->getMessage();
  header("Location: /");
  die;
} catch (Facebook\Exceptions\FacebookSDKException $e) {
  // When validation fails or other local issues
  echo 'Facebook SDK returned an error: ' . $e->getMessage();
  exit;
}

if (!isset($accessToken)) {
  /*if ($fb_helper->getError()) {
    header('HTTP/1.0 401 Unauthorized');
    echo "Error: " . $fb_helper->getError() . "\n";
    echo "Error Code: " . $fb_helper->getErrorCode() . "\n";
    echo "Error Reason: " . $fb_helper->getErrorReason() . "\n";
    echo "Error Description: " . $fb_helper->getErrorDescription() . "\n";
  } else {
    header('HTTP/1.0 400 Bad Request');
    echo 'Bad request';
  }*/
  header("Location: /");
  die;
}

// Logged in
$fb_token = $accessToken->getValue();

// The OAuth 2.0 client handler helps us manage access tokens
$oAuth2Client = $fb_client->getOAuth2Client();

// Get the access token metadata from /debug_token
$tokenMetadata = $oAuth2Client->debugToken($accessToken);
$user_key = $tokenMetadata->getProperty('user_id');

// Validation (these will throw FacebookSDKException's when they fail)
$tokenMetadata->validateAppId(secret('facebook_app_id')); // Replace {app-id} with your app id
// If you know the user ID this access token belongs to, you can validate it here
//$tokenMetadata->validateUserId('123');
$tokenMetadata->validateExpiration();

if (!$accessToken->isLongLived()) {
  try {
    $accessToken = $oAuth2Client->getLongLivedAccessToken($accessToken);
  } catch (Facebook\Exceptions\FacebookSDKException $e) {
    //echo "<p>Error getting long-lived access token: " . $e->getMessage() . "</p>\n\n";
    header("Location: /");
    die;
  }
}

$app["user"]["fb_access_token"] = (string) $accessToken;
$_SESSION["user"] = $app["user"];

$email = "";
if ($accessToken !== null) {
  $response = $fb_client->get('/me?fields=email,first_name,last_name', $accessToken);
  $user = $response->getGraphUser();
  $fb_email = $user->getProperty('email');
  $first_name = $user->getProperty('first_name');
  $last_name = $user->getProperty('last_name');
} else {
  header("Location: /");
  die;
}

$user_type = 'f';
$authentication_token = $user_key;

$user_data = fetchRow("SELECT user_id, email FROM users WHERE user_type = '$user_type' AND authentication_token = ?", [$authentication_token]);
if ($user_data) {
  $user_id = $user_data["user_id"];
  $email = $user_data["email"];
} else {
  $email = $fb_email;
  if (empty($email)) {
    $email = "";
  }

  query("INSERT INTO users (user_type,imie,nazwisko,email,authenticated,authentication_token,kraj,stworzono) VALUES (?,?,?,?,?,?,?,NOW())", [
    $user_type, $first_name, $last_name, $email, "1", $authentication_token, "Polska"
  ]);

  $user_id = getLastInsertedId();
}
login_user($user_id, $email, $user_type, ["name" => $first_name . " " . $last_name]);
