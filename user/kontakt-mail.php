<?php

include "kernel.php";

$message = "<h3>Temat: ".$_POST["subject"]."</h3><p style='font-size:13px'>".$_POST["message"]."<br><br>Email: ".$_POST["email"]."</p>";

$email = config('main_email');

//$to = "wojtekwo997@gmail.com";

$mailTitle = "Wiadomość od ".$_POST["name"];

sendEmail($email, $message, $mailTitle);