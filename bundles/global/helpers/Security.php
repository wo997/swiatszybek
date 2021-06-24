<?php

class Security
{
    public static function generateToken($length = 20)
    {
        return randomString($length);
    }

    public static function adminRequired()
    {
        if (!User::getCurrent()->priveleges["backend_access"]) {
            if (!IS_XHR) {
                $_SESSION["redirect_on_login"] = Request::$url;
                Request::setSingleUsageSessionVar("login", true);
            }
            Request::redirect("/");
        }
    }

    public static function loginRequired()
    {
        if (!User::getCurrent()->isLoggedIn()) {
            if (!IS_XHR) {
                $_SESSION["redirect_on_login"] = Request::$url;
                Request::setSingleUsageSessionVar("login", true);
            }
            Request::redirect("/");
        }
    }

    public static function validateEmail($val)
    {
        return filter_var($val, FILTER_VALIDATE_EMAIL);
    }

    public static function validatePassword($val)
    {
        return strlen($val) >= 8;
    }


    public static function verifyPassword($password, $password_hash)
    {
        return password_verify($password, $password_hash);
    }

    public static function getPasswordHash($val)
    {
        return password_hash($val, PASSWORD_BCRYPT, ['cost' => 12]);
    }

    public static function createAuthenticationToken($action, $expiry_datetime = null)
    {
        $token = Security::generateToken();

        if (!$expiry_datetime) {
            $expiry_datetime = date("Y-m-d H:i:s", strtotime("+24 hours"));
        }

        DB::insert("authentication_token", [
            "action" => $action,
            "token" => $token,
            "valid_untill" => $expiry_datetime
        ]);

        return $token;
    }

    public static function useAuthenticationToken($action, $token)
    {
        $res =
            /** @var ValidationResponse */
            [
                "errors" => [],
                "success" => false
            ];

        $token_data = DB::fetchRow("SELECT valid_untill FROM authentication_token WHERE token = ? AND action = ? ORDER BY valid_untill DESC", [$token, $action]);

        if (!$token_data) {
            $res["errors"][] = "Link do aktywacji jest niepoprawny";
            return $res;
        }

        if ($token_data["valid_untill"] && strtotime($token_data["valid_untill"]) <= time()) {
            $res["errors"][] = "Link utracił swoją ważność";
            return $res;
        }

        $res["success"] = true;
        return $res;
    }
}
