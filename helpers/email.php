<?php

$email_client_url_list = [
    "gmail.com" => "https://mail.google.com/",
    "wp.pl" => "https://profil.wp.pl/",
    "outlook.com" => "https://outlook.live.com/",
    "yahoo.com" => "https://mail.yahoo.com/",
    "icloud.com" => "https://icloud.com/mail",
    "aol.com" => "https://mail.aol.com/",
    "o2.pl" => "https://poczta.o2.pl/",
];

// send emails
$default_headers  = 'MIME-Version: 1.0' . "\r\n";
$default_headers .= 'Content-type: text/html; charset=UTF-8' . "\r\n";
$default_headers .= 'From: ' . config('main_email_sender') . ' <' . config('main_email') . "> \r\n" .
    'Reply-To: ' . config('main_email') . "\r\n" .
    'X-Mailer: PHP/' . phpversion();

function sendEmail($recipient, $message, $title, $headers = null, $from = null)
{
    global $default_headers;
    if ($headers === null) {
        $headers = $default_headers;
    }
    if ($from === null) {
        $from = config('main_email');
    }
    $title = "=?UTF-8?B?" . base64_encode($title) . "?=";
    @mail($recipient, $title, $message, $headers, "-f " . $from);
}

function getEmailHeader($lang)
{
    $person = "";
    if ($lang["firma"]) {
        $person = nonull($lang, "firma", "");
    } else {
        $person = nonull($lang, "imie", "") . " " . nonull($lang, "nazwisko", "");
    }

    return "<p style='font-size: 16px;max-width:700px'>$person,<br><br>";
}

function getEmailFooter()
{
    return "\n<br><br><i>Pozdrawiamy,</i><br><a href='" . SITE_URL . "'><img src='" . LOGO_PATH . "' style='width:200px'></a></p>";
}
