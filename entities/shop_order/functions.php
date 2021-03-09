<?php //hook[helper]

/**
 * getShopOrderLink
 *
 * @param  number $general_product_id
 * @param  number[] $option_ids
 * @param  string $name
 * @param  string[] $options_names
 * @return string
 */
function getShopOrderLink($shop_order_id, $reference)
{
    $link = "/zamowienie";
    $link .= "/" . $shop_order_id;
    $link .= "/" . $reference;
    return $link;
}
