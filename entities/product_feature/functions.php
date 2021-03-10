<?php //hook[helper]

function getFeatureDataTypes()
{
    return [
        "text_list" => [
            "description" => "Lista",
            "example" => "(np. kolorów)",
        ],
        "float_value" => [
            "description" => "Dowolna liczba całkowita",
            "example" => "(np. długość kabla)",
        ],
        "datetime_value" => [
            "description" => "Dowolna data",
            "example" => "(np. data premiery)",
        ],
        "text_value" => [
            "description" => "Dowolny tekst",
            "example" => "(dowolna unikalna nazwa nie wiem co wpisać)",
        ],
    ];
}

function getPhysicalMeasures()
{
    return [
        "weight" => [
            "description" => "Waga",
            "base_unit" => "kg",
            "units" => [
                "kg" => [
                    "factor" => 1
                ],
                "g" => [
                    "factor" => 0.001
                ],
                "t" => [
                    "factor" => 1000
                ],
            ]
        ],
        "length" => [
            "description" => "Długość",
            "base_unit" => "m",
            "units" => [
                "m" => [
                    "factor" => 1
                ],
                "cm" => [
                    "factor" => 0.01
                ],
                "mm" => [
                    "factor" => 0.001
                ],
                "km" => [
                    "factor" => 1000
                ],
            ]
        ],
        "digital_memory" => [
            "description" => "Pamięć cyfrowa",
            "base_unit" => "b",
            "units" => [
                "b" => [
                    "factor" => 1
                ],
                "B" => [
                    "factor" => 8
                ],
                "KB" => [
                    "factor" => 8 * 1024
                ],
                "MB" => [
                    "factor" => 8 * 1024 * 1024
                ],
                "GB" => [
                    "factor" => 8 * 1024 * 1024 * 1024
                ],
                "TB" => [
                    "factor" => 8 * 1024 * 1024 * 1024 * 1024
                ],
            ]
        ],
    ];
}

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
