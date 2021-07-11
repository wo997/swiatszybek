<?php //hook[helper]

function isAffiliateProgramCodeTaken($affiliate_program_code)
{
    $taken = DB::fetchVal("SELECT 1 FROM user WHERE affiliate_program_code = ?", [$affiliate_program_code]);
    return $taken;
}
