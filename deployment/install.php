<?php
$zip = new ZipArchive;
if ($zip->open('piepsklep.zip') === TRUE) {
    $zip->extractTo('/');
    $zip->close();
    echo 'ok';
} else {
    echo 'failed';
}
die;
