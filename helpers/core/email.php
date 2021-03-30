<?php

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
        $headers .= 'From: ' . $company_data['shop_name'] . ' <' . $company_data['main_email'] . "> \r\n" .
            'Reply-To: ' . $company_data['main_email'] . "\r\n" .
            'X-Mailer: PHP/' . phpversion();
    }
    if ($from === null) {
        $from = $company_data['main_email'];
    }
    $title = "=?UTF-8?B?" . base64_encode($title) . "?=";
    @mail($recipient, $title, $message, $headers, "-f " . $from);
}

function sendDefaultEmail($recipient, $message, $title, $who_label)
{
    $shop_name = getSetting(["general", "company", "shop_name"], "");
    if ($shop_name) {
        $title .= " - $shop_name";
    }
    $message = prepareEmail(getEmailHeader($who_label) . $message . getEmailFooter());
    sendEmail($recipient, $message, $title);
}

function getEmailHeader($who_label)
{
    return "<div style=\"font-size: 1.2em;margin: 0 0 10px;\">Witaj, $who_label!</div>";
}

function getEmailFooter()
{
    return "\n<br><i style=\"font-size:1.1em;font-weight: 600;\">Pozdrawiamy,</i><div style=\"margin-top:10px\"><a href=\"" . SITE_URL . "\"><img src=\"" . LOGO_PATH_PUBLIC_SM . "\" style=\"width:130px\"></a></div>\n";
}

function prepareEmail($message)
{
    if (preg_match_all('/\{.*?\}/', $message, $matches)) {
        foreach ($matches[0] as $match) {
            if ($match === "{label}") {
                $message = str_replace($match, "margin-top: 15px;font-weight: 600;", $message);
            }
            if ($match === "{link}") {
                $message = str_replace($match, "font-weight: 600;", $message);
            }
        }
    }

    return "<div style=\"font-size:15px;line-height: 1.7;\">$message</div>";
}
