<?php //route[{ADMIN}search_slider]  

Request::jsonResponse(paginateData([
    "select" => "slide_id, kolejnosc, content_desktop, content_mobile, published",
    "from" => "slides",
    "where" => "",
    "order" => "kolejnosc ASC",
    "quick_search_fields" => ["content_desktop", "content_mobile"],
]));
