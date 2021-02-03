<?php //route[{ADMIN}search_nowe_strony]

echo paginateData([
    "select" => "page_id, url, seo_title, seo_description, published",
    "from" => "page",
    "order" => "page_id DESC",
    "quick_search_fields" => ["url", "seo_title", "seo_description"],
]);
