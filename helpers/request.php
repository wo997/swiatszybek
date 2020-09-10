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
