<?php

// default values - overriden by 'build_info'
// TODO: not rly a todo, just remember about it ;)
$previousModificationTimePHP = 0;
$previousModificationTimeCSS = 0;
$previousModificationTimeJS = 0;
$previousModificationTimeModules = 0;
$previousModificationTimeSettings = 0;
$versionPHP = 0;
$versionCSS = 0;
$versionJS = 0;
$versionModules = 0;
$versionSettings = 0;

@include BUILD_INFO_PATH;

define("RELEASE", 2141);
define("CSS_RELEASE", $versionCSS);
define("JS_RELEASE", $versionJS);
define("MODULES_RELEASE", $versionModules);

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
