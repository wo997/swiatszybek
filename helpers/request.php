<?php

define("MESSAGE_HEADER_SUCCESS", "
    <div style='margin: -10px;margin-bottom: 0;background: var(--success-clr);color: white;'>
        <i class='fas fa-check-circle' style='font-size:30px'></i>
    </div>
");

define("MESSAGE_HEADER_ERROR", "
    <div style='margin: -10px;margin-bottom: 0;background: var(--error-clr);color: white;'>
        <i class='fas fa-times-circle' style='font-size:30px'></i>
    </div>
");

define("MESSAGE_OK_BUTTON", "
    <button class='btn success medium' onclick='hideParentModal(this)' style='width:80px'>
        Ok
    </button>
");

function json_response($response)
{
    die(json_encode($response));
}

function redirect($url)
{
    if (IS_XHR) {
        $_SESSION["redirect"] = $url;
        json_response(["redirect" => $url]);
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
            json_response(["reload" => true]);
        }
    } else {
        header("Refresh:0");
        die;
    }
}
