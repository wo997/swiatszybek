<?php //route[/product/search]  

$products = getGlobalProductsSearch($_POST["url"]);
Request::jsonResponse($products);
