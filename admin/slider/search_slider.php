<?php //->[admin/search_slider]  

echo getTableData([
    "select" => "slide_id, kolejnosc, content_desktop, content_mobile, published",
    "from" => "slides",
    "where" => "",
    "order" => "kolejnosc ASC",
    "main_search_fields" => ["content_desktop", "content_mobile"],
]);
