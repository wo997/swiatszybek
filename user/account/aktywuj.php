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

// TODO return messages with redirect idk do it
/*if ($authenticated == "1") {
  quit("Konto $email zostało aktywowane", 1);
} else {
  quit("Wystąpił błąd aktywacji konta", 0);
}*/
