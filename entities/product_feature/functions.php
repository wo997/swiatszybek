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
                    "id" => "mg",
                    "name" => "mg",
                    "factor" => 0.001 * 0.001
                ], [
                    "id" => "g",
                    "name" => "g",
                    "factor" => 0.001
                ], [
                    "id" => "kg",
                    "name" => "kg",
                    "factor" => 1
                ], [
                    "id" => "t",
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
                    "id" => "mm",
                    "name" => "mm",
                    "factor" => 0.001
                ], [
                    "id" => "cm",
                    "name" => "cm",
                    "factor" => 0.01
                ], [
                    "id" => "m",
                    "name" => "m",
                    "factor" => 1
                ], [
                    "id" => "km",
                    "name" => "km",
                    "factor" => 1000
                ],
            ]
        ],
        "digital_memory" => [
            "description" => "Pamięć cyfrowa",
            "base_unit" => "MB",
            "units" => [
                [
                    "id" => "b",
                    "name" => "b",
                    "factor" => 1 / 1024 / 1014 / 8
                ], [
                    "id" => "B",
                    "name" => "B",
                    "factor" => 1 / 1024 / 1014
                ], [
                    "id" => "KB",
                    "name" => "KB",
                    "factor" => 1 / 1024
                ], [
                    "id" => "MB",
                    "name" => "MB",
                    "factor" => 1
                ], [
                    "id" => "GB",
                    "name" => "GB",
                    "factor" => 1024
                ], [
                    "id" => "TB",
                    "name" => "TB",
                    "factor" => 1024 * 1024
                ],
            ]
        ],
        "price" => [
            "description" => "Cena",
            "base_unit" => "zł",
            "units" => [
                // [
                //     "id" => "gr",
                //     "name" => "gr",
                //     "factor" => 0.01
                // ],
                [
                    "id" => "pln",
                    "name" => "zł",
                    "factor" => 1
                ],
            ]
        ],
        "pressure" => [
            "description" => "Ciśnienie / Siła działająca na powierzchnię",
            "base_unit" => "N/m²",
            "units" => [
                [
                    "id" => "N.m2",
                    "name" => "N/m²",
                    "factor" => 1
                ],
                [
                    "id" => "N.cm2",
                    "name" => "N/cm²",
                    "factor" => 10000
                ],
                [
                    "id" => "N.mm2",
                    "name" => "N/mm²",
                    "factor" => 10000 * 100
                ],
            ]
        ],
    ];
}

$physical_measure_unit_map = [];
function getPhysicalMeasureUnitMap()
{
    global $physical_measure_unit_map;

    if (!$physical_measure_unit_map) {
        foreach (getPhysicalMeasures() as $physical_measure) {
            foreach ($physical_measure["units"] as $unit) {
                $physical_measure_unit_map[$unit["id"]] = [
                    "name" => $unit["name"],
                    "factor" => $unit["factor"],
                ];
            }
        }
    }

    return $physical_measure_unit_map;
}

function getPhysicalMeasureUnit($unit_id)
{
    return def(getPhysicalMeasureUnitMap(), $unit_id, ["name" => "", "factor" => 1]);
}


/**
 * prettyPrintPhysicalMeasure
 *
 * @param  float $double_value
 * @param  string $physical_measure
 * @return void
 */
function prettyPrintPhysicalMeasure($double_value, $physical_measure)
{
    $physical_measure_data = def(getPhysicalMeasures(), $physical_measure);

    if ($physical_measure_data) {
        $units = $physical_measure_data["units"];
        //usort($units, fn ($a, $b) => $a["factor"] <=> $b["factor"]);
        $target_unit = $units[0];
        foreach ($units as  $unit) {
            if ($unit["factor"] >= $double_value + 0.000001) {
                break;
            }
            $target_unit = $unit;
        }

        $accuracy = 100000;
        return (round($accuracy * $double_value / $target_unit["factor"]) / $accuracy) . " " . $target_unit["name"];
    }

    return $double_value;
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
