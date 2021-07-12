<?php //route[{USER}/affiliate_program/code/set]

$affiliate_program_code = $_POST["affiliate_program_code"];

$user  = User::getCurrent();
$user_id = $user->getId();

if (!$affiliate_program_code) {
    $affiliate_program_code = null;
} else {
    // the validation could be a part of the user entity but for real, nobody cares? 
    if (strlen($affiliate_program_code) < 3) {
        Request::jsonResponse(["success" => false, "message" => "Podaj min. 3 znaki"]);
    }
    if ($affiliate_program_code === DB::fetchVal("SELECT affiliate_program_code FROM user WHERE user_id = ?", [$user_id])) {
        Request::jsonResponse(["success" => false, "message" => "Kod się nie zmienił"]);
    }
    if (isAffiliateProgramCodeTaken($affiliate_program_code)) {
        Request::jsonResponse(["success" => false, "message" => "Kod jest zajęty"]);
    }
}

$user_entity = $user->getEntity();

try {
    DB::beginTransaction();
    $user_entity->setProp("affiliate_program_code", $affiliate_program_code);
    EntityManager::saveAll();
    DB::commitTransaction();
} catch (Exception $e) {
    var_dump($e);
    DB::rollbackTransation();
}

Request::jsonResponse(["success" => true]);
