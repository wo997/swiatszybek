<?php //hook[helper]

function getFeatureDataTypes()
{
    return [
        "text_list" => [
            "description" => "Lista",
            "example" => "(np. kolorów)",
            "icon" => "<i class=\"fas fa-list-ul product_feature_data_type_icon\"></i>",
        ],
        "double_value" => [
            "description" => "Dowolna liczba",
            "example" => "(np. długość kabla)",
            "icon" => "<i class=\"fas fa-sort-numeric-up-alt product_feature_data_type_icon\"></i>",
        ],
        "datetime_value" => [
            "description" => "Dowolna data",
            "example" => "(np. data premiery)",
            "icon" => "<i class=\"fas fa-calendar-alt product_feature_data_type_icon\"></i>",
        ],
        "text_value" => [
            "description" => "Dowolny tekst",
            "example" => "(dowolna unikalna nazwa nie wiem co wpisać)",
            "icon" => "<i class=\"fas fa-font product_feature_data_type_icon\"></i>",
        ],
    ];
}

function getPhysicalMeasures()
{
    return [
        "none" => [
            "description" => "Brak / Ilość",
            "base_unit" => "",
            "units" => []
        ],
        "weight" => [
            "description" => "Waga",
            "base_unit" => "kg",
            "units" => [
                [
                    "name" => "mg",
                    "factor" => 0.001 * 0.001
                ], [
                    "name" => "g",
                    "factor" => 0.001
                ], [
                    "name" => "kg",
                    "factor" => 1
                ], [
                    "name" => "t",
                    "factor" => 1000
                ],
            ]
        ],
        "length" => [
            "description" => "Długość",
            "base_unit" => "m",
            "units" => [
                [
                    "name" => "mm",
                    "factor" => 0.001
                ], [
                    "name" => "cm",
                    "factor" => 0.01
                ], [
                    "name" => "m",
                    "factor" => 1
                ], [
                    "name" => "km",
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
