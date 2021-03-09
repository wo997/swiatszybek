<?php //hook[helper]

function getFeatureDataTypes()
{
    return [
        "text_list" => [
            "description" => "Lista",
            "example" => "(np. kolorów)",
        ],
        "int_value" => [
            "description" => "Dowolna liczba całkowita",
            "example" => "(np. ilość kół samochodu)",
        ],
        "float_value" => [
            "description" => "Dowolna liczba zmiennoprzecinkowa",
            "example" => "(np. długość kabla)",
        ],
        "date_value" => [
            "description" => "Dowolna data",
            "example" => "(np. data premiery)",
        ],
        "text_value" => [
            "description" => "Dowolny tekst",
            "example" => "(dowolna unikalna nazwa nie wiem co wpisać)",
        ],
    ];
};


function getAllProductFeatures()
{
    return DB::fetchArr("SELECT * FROM product_feature");
}

function preloadProductFeatures()
{
    $product_features = json_encode(getAllProductFeatures());
    $product_feature_options = json_encode(getAllProductFeatureOptions());
    return <<<JS
    product_features = $product_features;
    product_feature_options = $product_feature_options;
	loadedProductFeatures();
JS;
}
