<?php

define("EMAIL_CLIENT_URLS", [
    "gmail.com" => "https://mail.google.com/",
    "wp.pl" => "https://profil.wp.pl/",
    "outlook.com" => "https://outlook.live.com/",
    "yahoo.com" => "https://mail.yahoo.com/",
    "icloud.com" => "https://icloud.com/mail",
    "aol.com" => "https://mail.aol.com/",
    "o2.pl" => "https://poczta.o2.pl/",
]);

function sendEmail($recipient, $message, $title, $headers = null, $from = null)
{
    global $app;

    if (DISPLAY_EMAIL) {

        debug([$title, $message]);
    }

    $company_data = $app["company_data"];

    if ($headers === null) {
        $headers  = 'MIME-Version: 1.0' . "\r\n";
        $headers .= 'Content-type: text/html; charset=UTF-8' . "\r\n";
        $headers .= 'From: ' . $company_data['email_sender'] . ' <' . $company_data['main_email'] . "> \r\n" .
            'Reply-To: ' . $company_data['main_email'] . "\r\n" .
            'X-Mailer: PHP/' . phpversion();
    }
    if ($from === null) {
        $from = $company_data['main_email'];
    }
    $title = "=?UTF-8?B?" . base64_encode($title) . "?=";
    @mail($recipient, $title, $message, $headers, "-f " . $from);
}

function getEmailHeader($lang)
{
    $person = "";
    if ($lang["firma"]) {
        $person = def($lang, "firma", "");
    } else {
        $person = def($lang, "imie", "") . " " . def($lang, "nazwisko", "");
    }

    return "<p style='font-size: 16px;max-width:700px'>$person,<br><br>";
}

function getEmailFooter()
{
    return "\n<br><br><i>Pozdrawiamy,</i><br><a href='" . SITE_URL . "'><img src='" . LOGO_PATH_PUBLIC_SM . "' style='width:200px'></a></p>";
}
