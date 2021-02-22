<?php //hook[helper]

function getAllProductCategories()
{
    return DB::fetchArr("SELECT * FROM product_category");
}
