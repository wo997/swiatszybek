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
    // to calculate base unit value you have to add and then multiply whatvever - yes, order matters
    return [
        "none" => [
            "description" => "Brak / Ilość",
            "base_unit" => "",
            "units" => [
                // [
                //     "id" => "",
                //     "name" => "",
                //     "multiply" => 1
                // ]
            ]
        ],
        "weight" => [
            "description" => "Waga",
            "base_unit" => "kg",
            "units" => [
                [
                    "id" => "mg",
                    "name" => "mg",
                    "multiply" => 0.001 * 0.001
                ], [
                    "id" => "g",
                    "name" => "g",
                    "multiply" => 0.001
                ], [
                    "id" => "kg",
                    "name" => "kg",
                    "multiply" => 1
                ], [
                    "id" => "t",
                    "name" => "t",
                    "multiply" => 1000
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
                    "multiply" => 0.001
                ], [
                    "id" => "cm",
                    "name" => "cm",
                    "multiply" => 0.01
                ],  [
                    "id" => "cal",
                    "name" => "\"",
                    "multiply" => 0.0254
                ], [
                    "id" => "m",
                    "name" => "m",
                    "multiply" => 1
                ], [
                    "id" => "km",
                    "name" => "km",
                    "multiply" => 1000
                ],
            ]
        ],
        "weight" => [
            "description" => "Waga",
            "base_unit" => "kg",
            "units" => [
                [
                    "id" => "mg",
                    "name" => "mg",
                    "multiply" => 0.001 * 0.001
                ], [
                    "id" => "g",
                    "name" => "g",
                    "multiply" => 0.001
                ], [
                    "id" => "dag",
                    "name" => "dag",
                    "multiply" => 0.01
                ], [
                    "id" => "kg",
                    "name" => "kg",
                    "multiply" => 1
                ],  [
                    "id" => "t",
                    "name" => "t",
                    "multiply" => 1000
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
                    "multiply" => 1 / 1024 / 1014 / 8
                ], [
                    "id" => "B",
                    "name" => "B",
                    "multiply" => 1 / 1024 / 1014
                ], [
                    "id" => "KB",
                    "name" => "KB",
                    "multiply" => 1 / 1024
                ], [
                    "id" => "MB",
                    "name" => "MB",
                    "multiply" => 1
                ], [
                    "id" => "GB",
                    "name" => "GB",
                    "multiply" => 1024
                ], [
                    "id" => "TB",
                    "name" => "TB",
                    "multiply" => 1024 * 1024
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
                //     "multiply" => 0.01
                // ],
                [
                    "id" => "pln",
                    "name" => "zł",
                    "multiply" => 1
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
                    "multiply" => 1
                ],
                [
                    "id" => "N.cm2",
                    "name" => "N/cm²",
                    "multiply" => 10000
                ],
                [
                    "id" => "bar",
                    "name" => "bar",
                    "multiply" => 100000
                ],
                [
                    "id" => "N.mm2",
                    "name" => "N/mm²",
                    "multiply" => 10000 * 100
                ],
            ]
        ],
        "current" => [
            "description" => "Natężenie prądu",
            "base_unit" => "mA",
            "units" => [
                [
                    "id" => "uA",
                    "name" => "µA",
                    "multiply" => 0.001
                ], [
                    "id" => "mA",
                    "name" => "mA",
                    "multiply" => 1
                ], [
                    "id" => "A",
                    "name" => "A",
                    "multiply" => 1000
                ],
            ]
        ],
        "voltage" => [
            "description" => "Napięcie prądu",
            "base_unit" => "V",
            "units" => [
                [
                    "id" => "V",
                    "name" => "V",
                    "multiply" => 1
                ], [
                    "id" => "KV",
                    "name" => "KV",
                    "multiply" => 1000
                ], [
                    "id" => "MV",
                    "name" => "MV",
                    "multiply" => 1000 * 1000
                ],
            ]
        ],
        "temperature" => [
            "description" => "Napięcie prądu",
            "base_unit" => "V",
            "single_unit" => true, // you can never tell when these are sorted, soooo maybe restrict to a single unit? :)
            "units" => [
                [
                    "id" => "K",
                    "name" => "K",
                    "multiply" => 1
                ], [
                    "id" => "oC",
                    "name" => "℃",
                    "multiply" => 1,
                    "add" => 273.15,
                ], [
                    "id" => "oF",
                    "name" => "℉",
                    "multiply" => 5 / 9,
                    "add" => 459.67,
                ],

            ]
        ]
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
                    "multiply" => $unit["multiply"],
                ];
            }
        }
    }

    return $physical_measure_unit_map;
}

function getPhysicalMeasureUnit($unit_id)
{
    return def(getPhysicalMeasureUnitMap(), $unit_id, ["name" => "", "multiply" => 1]);
}

/**
 * @typedef PrettyPhysicalMeasureData {
 * value: number
 * name: string
 * unit_id: string
 * }
 */

/**
 * prettyPrintPhysicalMeasure
 *
 * @param  float $double_value
 * @param  array $units
 * @return PrettyPhysicalMeasureData
 */
function prettyPrintPhysicalMeasure($double_value, $units)
{
    if ($units && isset($units[0])) {
        //usort($units, fn ($a, $b) => $a["multiply"] <=> $b["multiply"]); // sorted already
        $target_unit = $units[0];
        foreach ($units as $unit) {
            if ($unit["multiply"] >= $double_value + 0.000001) {
                break;
            }
            $target_unit = $unit;
        }

        $accuracy = 100000;
        return [
            "value" => round($accuracy * $double_value / $target_unit["multiply"]) / $accuracy,
            "unit_name" => $target_unit["name"],
            "unit_id" => $target_unit["id"],
        ];
    }

    return [
        "value" => $double_value,
        "unit_name" => "",
        "unit_id" => "",
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
