/* js[global] */

// also product.php
function getProductLink(product_id, link) {
	return `/produkt/${product_id}/${escapeUrl(link)}`;
}
