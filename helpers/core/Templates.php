<?php

$current_section_name = null;
function startSection($section_name)
{
    global $current_section_name;
    if ($current_section_name) {
        endSection();
    }
    ob_start();
    global $current_section_name;
    $current_section_name = $section_name;
}
$sections = [];
function endSection()
{
    global $current_section_name, $sections;
    if (!$current_section_name) return;
    $sections[$current_section_name] = def($sections, [$current_section_name], "") . ob_get_clean();
    $current_section_name = null;
}

// function renderTemplate($template_name)
// {
//     global $con, $admin_navigations;
//     if ($template_name == "admin_page") {
//         include "admin/default_page.php";
//     }
// }
