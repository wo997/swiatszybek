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
            $_SESSION["redirect_on_login"] = $_SERVER["REQUEST_URI"];
            Request::setSingleUsageSessionVar("login", true);
            redirect("/");
        }
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
