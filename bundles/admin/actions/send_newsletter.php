<?php //route[/{ADMIN}send_newsletter]



$posts = ["description", "title"];

foreach ($posts as $p) {
    if (!isset($_POST[$p]))
        die($p);

    $$p = $_POST[$p];
}

$message = "";

$message .= wordwrap($description);

$mailTitle = $title;

if (isset($mailTitle) && $mailTitle) {
    $stmt = $con->prepare("SELECT email, token FROM newsletter WHERE accepted = 1");
    $stmt->execute();
    $stmt->bind_result($email, $token);
    while (mysqli_stmt_fetch($stmt)) {
        //if ($email != "wojtekwo997@gmail.com") continue;
        $message .= "<br> <span style='font-size:14px;color:#666'>Nie chcesz otrzymywać newslettera? <a href='" . SITE_URL . "/potwierdz_newsletter/$token/anuluj'>Anuluj subskrybcję</a></span>";
        sendEmail($email, $message, $mailTitle);
    }
    $stmt->close();
}

Request::reload(Request::$static_urls["ADMIN"] . "newsletter?wyslano=tak");
