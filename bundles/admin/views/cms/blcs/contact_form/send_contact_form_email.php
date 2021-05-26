<?php //route[/send_contact_form_email]

$company_data = getSetting(["general", "company"], "");

$subject = $_POST["subject"] . " - wiadomość od klienta - " . $company_data['shop_name'];

$message = "<div style=\"{label}\">Nadawca</div>\n";
$message .= "<div>" . $_POST["name"] . "</div>\n";
$message .= "<div style=\"{label}\">Wiadomość</div>\n";
$message .= "<div>" . $_POST["message"] . "</div>\n";

//$company_data['main_email'] = "wojtekwo997@gmail.com";
sendEmail($company_data['main_email'], prepareEmail($message), $subject);
