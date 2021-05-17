<?php

foreach ($build_template_ids as $template_id) {
    buildPageable("template", $template_id);
}
foreach ($build_page_ids as $page_id) {
    buildPageable("page", $page_id);
}
