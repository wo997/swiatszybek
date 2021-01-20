<?php

//processImage("uploads/df/logo_170x59.png");
//die;
foreach (DB::fetchCol("SELECT file_path FROM uploads") as $file_path) {
    processImage($file_path);
}
