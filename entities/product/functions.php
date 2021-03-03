<?php //hook[helper]

/**
 * getProductLink
 *
 * @param  number $general_product_id
 * @param  number[] $option_ids
 * @param  string $name
 * @param  string[] $options_names
 * @return string
 */
function getProductLink($general_product_id, $option_ids, $name, $options_names)
{
    $link = "/produkt";
    $link .= "/" . $general_product_id;
    foreach ($option_ids as $option_id) {
        $link .= "~" . $option_id;
    }
    foreach ($options_names as $options_name) {
        $name .= " " . $options_name;
    }
    $link .= "/" . escapeUrl($name);
    return $link;
}
