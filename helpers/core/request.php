<?php

define("MESSAGE_HEADER_SUCCESS", "
    <div class='messagebox_header' style='background: var(--success-clr);color: white;'>
        <i class='fas fa-check-circle' style='font-size:30px'></i>
    </div>
");

define("MESSAGE_HEADER_ERROR", "
    <div class='messagebox_header' style='background: var(--error-clr);color: white;'>
        <i class='fas fa-times-circle' style='font-size:30px'></i>
    </div>
");

define("MESSAGE_OK_BUTTON", "
    <button class='btn success medium' onclick='hideParentModal(this)' style='width:80px'>
        Ok
    </button>
");

function jsonResponse($response)
{
    die(json_encode($response));
}

function redirect($url)
{
    if (IS_XHR) {
        $_SESSION["redirect"] = $url;
        jsonResponse(["redirect" => $url]);
    } else {
        header("Location: $url");
        die;
    }
}

function reload($ask = false)
{
    if (IS_XHR) {
        if ($ask) {
            echo "[reload_required]";
        } else {
            jsonResponse(["reload" => true]);
        }
    } else {
        ob_clean();
        header("Refresh:0");
        die;
    }
}

class Request
{
    // u can use it for views yay
    private static $ready = false;
    public static $url;
    public static $route = null;
    private static $url_params;
    private static $single_usage_session = null;
    public static $is_admin_url = null;
    public static $is_deployment_url = null;
    public static $static_urls = ["ADMIN" => "/admin/"];

    public static function init()
    {

        if (!self::$ready) {
            self::$ready = true;

            self::$url = rtrim(isset($_GET['url']) ? $_GET['url'] : "", "/");
            self::$url_params = explode("/", self::$url);

            self::$is_admin_url = strpos(self::$url, ltrim(Request::$static_urls["ADMIN"], "/")) === 0;
            self::$is_deployment_url = strpos(self::$url, "deployment") === 0;

            self::$single_usage_session = def($_SESSION, "single_usage_session", []);
            if (!IS_XHR) {
                unset($_SESSION["single_usage_session"]);
            }
        }
    }

    public static function setSingleUsageSessionVar($name, $val)
    {
        $_SESSION["single_usage_session"][$name] = $val;
    }

    public static function getSingleUsageSessionVar($name)
    {
        return def(self::$single_usage_session, $name, "");
    }

    public static function urlParam($index, $default = "")
    {
        // TODO: add index from the url? well, it's harded than I thought
        return def(self::$url_params, $index, $default);
    }
}
