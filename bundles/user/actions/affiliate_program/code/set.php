<?php //route[{USER}/affiliate_program/code/set]

$affiliate_program_code = $_POST["affiliate_program_code"];

if (!$affiliate_program_code) {
    $affiliate_program_code = null;
} else {
    if (strlen($affiliate_program_code) < 3) {
        Request::jsonResponse(["success" => false, "message" => "Zbyt krótki kod"]);
    }
    if (isAffiliateProgramCodeTaken($affiliate_program_code)) {
        Request::jsonResponse(["success" => false, "message" => "Kod jest zajęty"]);
    }
}

$user_id = User::getCurrent()->getId();

DB::update("user", ["affiliate_program_code" => $affiliate_program_code], "user_id = $user_id");

Request::jsonResponse(["success" => true]);
