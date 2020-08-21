<?php //route[user_notify_variant]

$posts = ["variant_id", "email"];

foreach ($posts as $p) {
    if (!isset($_POST[$p]))
        die;

    $$p = $_POST[$p];
}

$stmt = $con->prepare("SELECT requested FROM notifications WHERE email = ? AND variant_id = ? AND sent = 0");
$stmt->bind_param("ss", $email, $variant_id);
$stmt->execute();
$stmt->bind_result($requested);
$res = mysqli_stmt_fetch($stmt);
$stmt->close();


if (!$res) {
    $set_user = $app["user"]["id"] ? intval($app["user"]["id"]) : "NULL";
    $stmt = $con->prepare("INSERT INTO notifications (user_id, variant_id, email, requested) VALUES ($set_user,?,?,NOW())");
    $stmt->bind_param("ss", $variant_id, $email);
    $stmt->execute();
    $stmt->close();
}

$v_id = $variant_id;
$stmt = $con->prepare("SELECT stock, i.title, v.product_id, image, v.name FROM variant v INNER JOIN products i ON i.product_id = v.product_id WHERE variant_id = " . intval($v_id));
$stmt->execute();
$stmt->bind_result($q, $a_title, $a_product_id, $a_image, $a_v_name);
mysqli_stmt_fetch($stmt);
$stmt->close();

if ($app["user"]["id"]) {
    $stmt = $con->prepare("SELECT imie, nazwisko, email FROM users u WHERE user_id = " . intval($app["user"]["id"]));
    $stmt->execute();
    $stmt->bind_result($a_imie, $a_nazwisko, $a_email);
    mysqli_stmt_fetch($stmt);
    $stmt->close();
} else {
    $a_imie = "";
    $a_nazwisko = "";
    $a_email = $email;
}

$name = getLink($a_title);

$mailTitle = "$a_imie $a_nazwisko $a_email oczekuje na $a_title - " . config('main_email_sender');

$message = "<p>$a_imie $a_nazwisko $a_email oczekuje na $a_title $a_v_name</p>";
$message .= "<a href='" . SITE_URL . "/produkt/$a_product_id/$name' style='color:#37f;font-weight:bold;font-size:16px'>Zobacz produkt</a><br><br>";
$message .= "<img style='max-width:300px' src=\"" . SITE_URL . "/uploads/sm/$a_image\"'>";

sendEmail(config('main_email'), $message, $mailTitle);
sendEmail("wojtekwo997@gmail.com", $message, $mailTitle);

die;
