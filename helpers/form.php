<?php

function validateEmail($val)
{
    return filter_var($val, FILTER_VALIDATE_EMAIL);
}

function validatePassword($val)
{
    return strlen($val) >= 8;
}
