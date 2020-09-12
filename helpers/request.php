<?php

define("MESSAGE_HEADER_SUCCESS", "
    <div style='margin: -10px;margin-bottom: 0;background: var(--primary-clr);color: white;'>
        <i class='fas fa-check-circle' style='font-size:30px'></i>
    </div>
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

function reload()
{
    if (IS_XHR) {
        json_response(["reload" => true]);
    } else {
        header("Refresh:0");
        die;
    }
}
