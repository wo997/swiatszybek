<?php

// default values - overriden by 'build_info'
// TODO: not rly a todo, just remember about it ;)
$prev_mod_time_php = 0;
$prev_mod_time_css = 0;
$prev_mod_time_js = 0;
$prev_mod_time_modules = 0;
$prev_mod_time_settings = 0;
$version_php = 0;
$version_css = 0;
$version_js = 0;
$version_modules = 0;
$version_settings = 0;

@include BUILD_INFO_PATH;

define("RELEASE", 2148);
define("CSS_RELEASE", $version_css);
define("JS_RELEASE", $version_js);
define("MODULES_RELEASE", $version_modules);

$link_route_path = @include BUILDS_PATH . "link_route_path.php";
if (!$link_route_path) {
    $link_route_path = [];
}

$link_module_path = @include BUILDS_PATH . "link_module_path.php";
if (!$link_module_path) {
    $link_module_path = [];
}

$link_event_paths = @include BUILDS_PATH . "link_event_paths.php";
if (!$link_event_paths) {
    $link_event_paths = [];
}

$link_module_block_php_path = @include BUILDS_PATH . "link_module_block_php_path.php";
if (!$link_module_block_php_path) {
    $link_module_block_php_path = [];
}

$link_module_block_form_path = @include BUILDS_PATH . "link_module_block_form_path.php";
if (!$link_module_block_form_path) {
    $link_module_block_form_path = [];
}

$link_module_form_path = @include BUILDS_PATH . "link_module_form_path.php";
if (!$link_module_form_path) {
    $link_module_form_path = [];
}
