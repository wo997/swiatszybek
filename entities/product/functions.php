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
function getProductLink($general_product_id, $name, $option_ids = [], $options_names = [])
{
    $link = "/produkt";
    $link .= "/" . $general_product_id;
    $link .= "/" . escapeUrl($name);
    if ($option_ids) {
        $link .= "/" . join("~", $option_ids);
    }
    if ($options_names) {
        $link .= "/" . escapeUrl(join(" ", $options_names));
    }
    return $link;
}
