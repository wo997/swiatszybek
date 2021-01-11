<?php //route[potwierdz_newsletter]

$token = urlParam(1);
$anuluj = urlParam(2);

$accepted = $anuluj ? "0" : "1";

query("UPDATE newsletter SET accepted = $accepted WHERE token = ?", [$token]);

$email = fetchValue("SELECT email FROM newsletter WHERE token = ?", [$token]);

function quit($message, $type)
{
    echo '<form style="display:none" id="myForm" action="/" method="post">';
    if ($type == 0)
        $color = "#c44";
    else
        $color = "#4c4";

    $message = "<div style='text-align:center;'><h4 style='color: $color;display: inline-block;border: 1px solid $color;padding: 7px;margin: 0 auto;border-radius: 5px;'>$message</h4></div>";
    echo '<input type="text" name="message" value="' . $message . '">';
    echo '</form>';
    echo '<script>';
    echo 'document.querySelector("#myForm").submit();';
    echo '</script>';
    die;
}

if ($email) {
    if ($anuluj)
        $message = "<h3 style='color:#a44'>Zrezygnowaleś z newslettera " . $app["company_data"]['email_sender'] . "</h3><br><a style='font-size:16px;' href='" . SITE_URL . "/potwierdz_newsletter/$token'>Zapisz się ponownie</a>";
    else {
        $message = "<h3>Zapisałeś się do newslettera " . $app["company_data"]['email_sender'] . "</h3><br><a style='font-size:14px;color:#666' href='" . SITE_URL . "/potwierdz_newsletter/$token/anuluj'>Zrezygnuj z NEWSLETTERA</a>";
    }

    if ($anuluj)
        $mailTitle = "Zrezygnowano z newslettera " . $app["company_data"]['email_sender'] . " " . date("d-m-Y");
    else
        $mailTitle = "Zapisano się do newslettera " . $app["company_data"]['email_sender'] . " " . date("d-m-Y");

    sendEmail($email, $message, $mailTitle);

    if ($anuluj)
        quit("Zrezygnowano z newslettera dla $email", 0);
    else
        quit("Zapisano $email do newslettera", 1);
}
