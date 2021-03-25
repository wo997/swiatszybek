<?php

// default values - overriden by 'build_info'
// TODO: not rly a todo, just remember about it ;)
$prev_mod_time_php = 0;
$prev_mod_time_assets = 0;
$prev_mod_time_settings = 0;
$version_php = 0;
$version_assets = 0;
$version_settings = 0;

@include BUILD_INFO_PATH;

define("ASSETS_RELEASE", $version_assets);

$link_route_path = @include BUILDS_PATH . "link_route_path.php";
if (!$link_route_path) {
    $link_route_path = [];
}

$link_event_paths = @include BUILDS_PATH . "link_event_paths.php";
if (!$link_event_paths) {
    $link_event_paths = [];
}

$css_schema = [];
$css_schema = @include BUILDS_PATH . "css_schema.php";
Assets::setCssSchema($css_schema);

$js_schema = [];
$js_schema = @include BUILDS_PATH . "js_schema.php";
Assets::setJsSchema($js_schema);
