<?php

if (isset($build_template_ids)) {
    foreach ($build_template_ids as $template_id) {
        buildPageable("template", $template_id);
    }
}
if (isset($build_page_ids)) {
    foreach ($build_page_ids as $page_id) {
        buildPageable("page", $page_id);
    }
}
