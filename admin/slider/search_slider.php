<?php //->[admin/search_slider]  

echo getTableData([
    "select" => "slide_id, kolejnosc, content",
    "from" => "slides",
    "where" => "",
    "order" => "kolejnosc ASC",
    "main_search_fields" => ["content"],
]);
