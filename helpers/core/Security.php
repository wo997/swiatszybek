<?php

class Security
{
    public static function generateToken($length = 20)
    {
        return randomString($length);
    }
}
