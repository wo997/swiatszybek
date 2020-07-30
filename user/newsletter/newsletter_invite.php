<?php //route[newsletter_invite]

$posts = ["email"];

foreach ($posts as $p) {
    if (!isset($_POST[$p]))
        die;
}

$email = $_POST["email"];

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) die;

$stmt = $con->prepare("SELECT person_id, token, accepted FROM newsletter WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->bind_result($person_id, $token, $accepted);
$res = mysqli_stmt_fetch($stmt);
$stmt->close();

if (!$res) {
    $token = md5($email . "ASDFfsadfasd4356");

    $accepted = 0;
    $stmt = $con->prepare("INSERT INTO newsletter (token, accepted, email, invitation_sent) VALUES (?,?,?,NOW())");
    $stmt->bind_param("sss", $token, $accepted, $email);
    $stmt->execute();
    $stmt->close();
}

// send mail no matter if exists to make sure he will receive it

$message = "<h3>Kliknij w link poniżej, jeśli chcesz zapisać się do newslettera " . config('main_email_sender') . "</h3><br><a style='font-size:16px' href='$SITE_URL/potwierdz_newsletter/$token'>Zapisz się do NEWSLETTERA</a>";

$mailTitle = "Zapisz się do newslettera " . config('main_email_sender') . " " . date("d-m-Y");

sendEmail($email, $message, $mailTitle);
