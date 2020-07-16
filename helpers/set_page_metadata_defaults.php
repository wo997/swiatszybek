<?php
// input/output $page_metadata_json
$default_metadata = [
    "page_width" => "1500px",
    "page_padding" => "45px"
];
foreach ($default_metadata as $key => $value) {
    if (!isset($page_metadata_json[$key])) {
        $page_metadata_json[$key] = $value;
    }
}