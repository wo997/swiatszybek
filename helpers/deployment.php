<?php

function createDir($dir)
{
    if (file_exists($dir)) {
        return;
    }
    mkdir($dir);
}
