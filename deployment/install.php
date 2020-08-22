<?php
$zip = new ZipArchive;
if ($zip->open('export.zip') === TRUE) {
    $zip->extractTo('/');
    $zip->close();
    echo 'ok';
} else {
    echo 'failed';
}
die;
