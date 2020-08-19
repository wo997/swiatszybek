<?php

function oneline($str)
{
    return str_replace("\n", " ", htmlspecialchars($str));
}
