<?php //hook[helper]

function preloadUECountries()
{
    $ue_countries_json = json_encode(getUECountries());
    //$options = printUECountriesOptions();
    return <<<JS
    ue_countries = $ue_countries_json;
JS;
}

// function printUECountriesOptions()
// {
//     $html = "";
//     foreach (getUECountries() as $country) {
//         $name = $country["nazwa"];
//         $html .= "<option value=\"$name\">$name</option>\n";
//     }
//     return $html;
// }

function getUECountries()
{
    $countries_json = <<<JSON
    [
    {
      "code": "AT",
      "nazwa": "Austria",
      "name": "Austria"
    },
    {
      "code": "BE",
      "nazwa": "Belgia",
      "name": "Belgium"
    },
    {
      "code": "BG",
      "nazwa": "Bułgaria",
      "name": "Bulgaria"
    },
    {
      "code": "HR",
      "nazwa": "Chorwacja",
      "name": "Croatia"
    },
    {
      "code": "CY",
      "nazwa": "Cypr",
      "name": "Cyprus"
    },
    {
      "code": "CZ",
      "nazwa": "Czechy",
      "name": "Czechia"
    },
    {
      "code": "DK",
      "nazwa": "Dania",
      "name": "Denmark"
    },
    {
      "code": "EE",
      "nazwa": "Estonia",
      "name": "Estonia"
    },
    {
      "code": "FI",
      "nazwa": "Finlandia",
      "name": "Finland"
    },
    {
      "code": "FR",
      "nazwa": "Francja",
      "name": "France"
    },
    {
      "code": "GR",
      "nazwa": "Grecja",
      "name": "Greece"
    },
    {
      "code": "ES",
      "nazwa": "Hiszpania",
      "name": "Spain"
    },
    {
      "code": "IE",
      "nazwa": "Irlandia",
      "name": "Ireland"
    },
    {
      "code": "LT",
      "nazwa": "Litwa",
      "name": "Lithuania"
    },
    {
      "code": "LU",
      "nazwa": "Luksemburg",
      "name": "Luxemburg"
    },
    {
      "code": "LV",
      "nazwa": "Łotwa",
      "name": "Latvia"
    },
    {
      "code": "MT",
      "nazwa": "Malta",
      "name": "Malta"
    },
    {
      "code": "NL",
      "nazwa": "Holandia",
      "name": "Netherlands"
    },
    {
      "code": "DE",
      "nazwa": "Niemcy",
      "name": "Germany"
    },
    {
      "code": "PL",
      "nazwa": "Polska",
      "name": "Poland"
    },
    {
      "code": "PT",
      "nazwa": "Portugalia",
      "name": "Portugal"
    },
    {
      "code": "RO",
      "nazwa": "Rumunia",
      "name": "Romania"
    },
    {
      "code": "SK",
      "nazwa": "Słowacja",
      "name": "Slovakia"
    },
    {
      "code": "SI",
      "nazwa": "Słowenia",
      "name": "Slovenia"
    },
    {
      "code": "SE",
      "nazwa": "Szwecja",
      "name": "Sweden"
    },
    {
      "code": "HU",
      "nazwa": "Węgry",
      "name": "Hungary"
    },
    {
      "code": "IT",
      "nazwa": "Włochy",
      "name": "Italy"
    }
   ]
JSON;

    return json_decode($countries_json, true);
}
