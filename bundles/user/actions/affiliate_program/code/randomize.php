<?php //route[{USER}/affiliate_program/code/randomize]

$cnt = 0;
while (true) {
    if ($cnt++ > 3) {
        die;
    }

    $affiliate_program_code = randomString(6);

    if (!isAffiliateProgramCodeTaken($affiliate_program_code)) {
        break;
    }
}

Request::jsonResponse(["affiliate_program_code" => $affiliate_program_code]);
