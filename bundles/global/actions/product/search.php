<?php //route[/product/search]  

$products = getGlobalProductsSearch($_POST);
Request::jsonResponse($products);
